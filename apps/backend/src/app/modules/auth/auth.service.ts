import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RoleService } from '../role/role.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { User } from '../user/user.model';

interface AuthResponse {
  user: User;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private jwtService: JwtService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  async register(registerInput: RegisterInput): Promise<AuthResponse> {
    const { email, password, firstName, lastName, phoneNumber } = registerInput;

    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const clientRole = await this.roleService.findByName('client');
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

    const accessToken = this.generateJwtToken(user.id, user.email);
    return { user, accessToken };
  }

  private generateJwtToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
