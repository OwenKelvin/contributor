import { randomBytes } from 'crypto';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RoleService } from '../role/role.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { GraphQLError } from 'graphql/error';
import { RoleList } from '../role/role-list';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction } from '../activity/activity.model';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { AuthResponse } from './types/auth-response.type';
import { RateLimitService } from './rate-limit.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private jwtService: JwtService,
    private activityService: ActivityService,
    private configService: ConfigService,
    private rateLimitService: RateLimitService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async register(registerInput: RegisterInput): Promise<AuthResponse> {
    const { email, password, firstName, lastName, phoneNumber } = registerInput;

    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new GraphQLError('Validation failed', {
        extensions: {
          code: 'BAD_USER_INPUT',
          validationErrors: {
            email: 'User with this email already exists',
          },
        },
      });
    }

    const clientRole = await this.roleService.findByName(RoleList.Client);
    if (!clientRole) {
      throw new BadRequestException(
        'Client role not found. Please seed roles.',
      );
    }

    const user = await this.userService.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      roles: [clientRole],
    });

    // Add job to email queue
    await this.emailQueue.add('sendWelcomeEmail', {
      to: user.email,
      name: user.firstName,
    });

    // Log registration activity
    await this.activityService.logActivity({
      userId: user.id,
      action: ActivityAction.USER_CREATED,
      targetId: user.id,
      targetType: 'User' as any,
      details: JSON.stringify({
        email: user.email,
        registeredAt: new Date().toISOString(),
      }),
    });

    const accessToken = this.generateJwtToken(user.id, user.email);
    return { user, accessToken };
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const { email, password } = loginInput;

    const user = await this.userService.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Your account has been banned.');
    }

    // Log login activity
    await this.activityService.logActivity({
      userId: user.id,
      action: ActivityAction.USER_LOGIN,
      details: JSON.stringify({
        email: user.email,
        loginAt: new Date().toISOString(),
      }),
    });

    const accessToken = this.generateJwtToken(user.id, user.email);
    return { user, accessToken };
  }

  async googleLogin(idToken: string): Promise<AuthResponse> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google ID token payload.');
      }

      const { email, given_name: firstName, family_name: lastName, picture } = payload;

      if (!email) {
        throw new BadRequestException('Google account must have an email address.');
      }

      return this._findOrCreateUserAndGenerateToken({
        email,
        firstName,
        lastName,
        picture,
        loginMethod: 'Google OAuth',
      });
    } catch (error) {
      console.error('Google ID token verification failed:', error);
      throw new UnauthorizedException('Google authentication failed.');
    }
  }

  private async _findOrCreateUserAndGenerateToken(
    userDetails: {
      email: string;
      firstName?: string;
      lastName?: string;
      picture?: string;
      loginMethod: string;
    },
  ): Promise<AuthResponse> {
    let user = await this.userService.findByEmail(userDetails.email);

    if (!user) {
      // If user doesn't exist, create a new one
      const clientRole = await this.roleService.findByName(RoleList.Client);
      if (!clientRole) {
        throw new BadRequestException(
          'Client role not found. Please seed roles.',
        );
      }

      user = await this.userService.create({
        email: userDetails.email,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        picture: userDetails.picture,
        roles: [clientRole],
      });

      // Log social registration activity
      await this.activityService.logActivity({
        userId: user.id,
        action: ActivityAction.USER_CREATED,
        targetId: user.id,
        targetType: 'User' as any,
        details: JSON.stringify({
          email: user.email,
          registeredAt: new Date().toISOString(),
          method: userDetails.loginMethod,
        }),
      });
    } else {
      // If user exists, log social login activity
      await this.activityService.logActivity({
        userId: user.id,
        action: ActivityAction.USER_LOGIN,
        details: JSON.stringify({
          email: user.email,
          loginAt: new Date().toISOString(),
          method: userDetails.loginMethod,
        }),
      });
    }

    const accessToken = this.generateJwtToken(user.id, user.email);
    return { user, accessToken };
  }

  private generateJwtToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // To prevent user enumeration, we don't throw an error here.
      // We just return true and do nothing.
      return true;
    }

    const token = randomBytes(32).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    user.passwordResetTokenUsed = false;
    await user.save();

    const resetLink = `${this.configService.get<string>(
      'FRONTEND_URL',
    )}/reset-password?token=${token}`;

    await this.emailQueue.add('sendPasswordResetEmail', {
      to: user.email,
      name: user.firstName,
      resetLink,
    });

    await this.activityService.logActivity({
      userId: user.id,
      action: ActivityAction.PASSWORD_RESET_REQUEST,
      details: JSON.stringify({
        email: user.email,
        requestedAt: new Date().toISOString(),
      }),
    });

    return true;
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<AuthResponse> {
    const user = await this.userService.findByPasswordResetToken(token);

    if (
      !user ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date() ||
      user.passwordResetTokenUsed
    ) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.passwordResetTokenUsed = true;
    await user.save();

    await this.activityService.logActivity({
      userId: user.id,
      action: ActivityAction.PASSWORD_RESET_SUCCESS,
      details: JSON.stringify({
        email: user.email,
        resetAt: new Date().toISOString(),
      }),
    });

    const accessToken = this.generateJwtToken(user.id, user.email);
    return { user, accessToken };
  }

  async requestMagicLink(email: string): Promise<boolean> {
    const rateLimitKey = `magic_link:${email.toLowerCase()}`;
    const { allowed } = await this.rateLimitService.checkRateLimit(
      rateLimitKey,
      5,
      3600, // 1 hour
    );

    if (!allowed) {
      throw new HttpException(
        'Too many magic link requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const user = await this.userService.findByEmail(email);
    if (!user) {
      return true; // Prevent user enumeration
    }

    const token = randomBytes(32).toString('hex');
    user.magicLinkToken = token;
    user.magicLinkExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    user.magicLinkTokenUsed = false;
    await user.save();

    const magicLink = `${this.configService.get<string>(
      'FRONTEND_URL',
    )}/login?magicToken=${token}`;

    await this.emailQueue.add('sendMagicLinkEmail', {
      to: user.email,
      name: user.firstName || 'there',
      magicLink,
    });

    await this.activityService.logActivity({
      userId: user.id,
      action: ActivityAction.MAGIC_LINK_REQUESTED,
      details: JSON.stringify({
        email: user.email,
        requestedAt: new Date().toISOString(),
      }),
    });

    return true;
  }

  async magicLinkLogin(
    token: string,
    acceptTerms?: boolean,
  ): Promise<{
    requiresTermsAcceptance: boolean;
    user?: any;
    accessToken?: string;
  }> {
    const user = await this.userService.findByMagicLinkToken(token);

    if (
      !user ||
      !user.magicLinkExpires ||
      user.magicLinkExpires < new Date() ||
      user.magicLinkTokenUsed
    ) {
      throw new BadRequestException('Invalid or expired magic link token.');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Your account has been banned.');
    }

    // Check if user is new (hasn't accepted terms yet)
    const isNewUser = !user.acceptedTermsAt;
    if (isNewUser && !acceptTerms) {
      return { requiresTermsAcceptance: true };
    }

    // If new user and accepting terms, create account
    if (isNewUser && acceptTerms) {
      const clientRole = await this.roleService.findByName(RoleList.Client);
      if (!clientRole) {
        throw new BadRequestException(
          'Client role not found. Please seed roles.',
        );
      }

      await user.$set('roles', [clientRole]);
      user.acceptedTermsAt = new Date();
      await user.save();

      await this.activityService.logActivity({
        userId: user.id,
        action: ActivityAction.TERMS_ACCEPTED,
        details: JSON.stringify({
          email: user.email,
          acceptedAt: new Date().toISOString(),
          method: 'Magic Link',
        }),
      });

      await this.activityService.logActivity({
        userId: user.id,
        action: ActivityAction.USER_CREATED,
        targetId: user.id,
        targetType: 'User' as any,
        details: JSON.stringify({
          email: user.email,
          registeredAt: new Date().toISOString(),
          method: 'Magic Link',
        }),
      });
    }

    // Mark token as used
    user.magicLinkTokenUsed = true;
    await user.save();

    await this.activityService.logActivity({
      userId: user.id,
      action: ActivityAction.MAGIC_LINK_LOGIN_SUCCESS,
      details: JSON.stringify({
        email: user.email,
        loginAt: new Date().toISOString(),
        isNewUser,
      }),
    });

    const accessToken = this.generateJwtToken(user.id, user.email);
    return { requiresTermsAcceptance: false, user, accessToken };
  }
}
