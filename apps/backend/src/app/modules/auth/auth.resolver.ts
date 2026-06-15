import { Logger } from '@nestjs/common';
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import {
  RequestPasswordResetInput,
  ResetPasswordInput,
} from './dto/password-reset.input';
import { MagicLinkLoginInput } from './dto/magic-link.input';
import { AuthResponse } from './types/auth-response.type';

@Resolver()
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(private authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async register(
    @Args('registerInput') registerInput: RegisterInput,
  ): Promise<AuthResponse> {
    return this.authService.register(registerInput);
  }

  @Mutation(() => AuthResponse)
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  @Mutation(() => AuthResponse)
  async googleLogin(@Args('idToken') idToken: string): Promise<AuthResponse> {
    return this.authService.googleLogin(idToken);
  }

  @Mutation(() => Boolean)
  async requestPasswordReset(
    @Args('requestPasswordResetInput')
    requestPasswordResetInput: RequestPasswordResetInput,
  ): Promise<boolean> {
    return this.authService.requestPasswordReset(
      requestPasswordResetInput.email,
    );
  }

  @Mutation(() => AuthResponse)
  async resetPassword(
    @Args('resetPasswordInput') resetPasswordInput: ResetPasswordInput,
  ): Promise<AuthResponse> {
    return this.authService.resetPassword(
      resetPasswordInput.token,
      resetPasswordInput.newPassword,
    );
  }

  @Mutation(() => Boolean)
  async requestMagicLink(
    @Args('email') email: string,
  ): Promise<boolean> {
    this.logger.log(`requestMagicLink mutation called for ${email}`);
    const result = await this.authService.requestMagicLink(email);
    this.logger.log(`requestMagicLink mutation completed for ${email}: ${result}`);
    return result;
  }

  @Mutation(() => AuthResponse, { nullable: true })
  async magicLinkLogin(
    @Args('magicLinkLoginInput') magicLinkLoginInput: MagicLinkLoginInput,
  ): Promise<any> {
    const result = await this.authService.magicLinkLogin(
      magicLinkLoginInput.token,
      magicLinkLoginInput.acceptTerms,
    );

    if (result.requiresTermsAcceptance) {
      return { requiresTermsAcceptance: true };
    }

    return {
      user: result.user,
      accessToken: result.accessToken,
      requiresTermsAcceptance: false,
    };
  }
}
