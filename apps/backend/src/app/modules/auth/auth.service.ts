import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { RoleService } from '../role/role.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private jwtService: JwtService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  async register(registerInput: RegisterInput): Promise<string> {
    const { email, password, firstName, lastName } = registerInput;

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
      roles: [clientRole],
    });

    // Add job to email queue
    await this.emailQueue.add('sendWelcomeEmail', {
      to: user.email,
      name: user.firstName,
    });

    return this.generateJwtToken(user.id, user.email);
  }

  async login(loginInput: LoginInput): Promise<string> {
    const { email, password } = loginInput;

    const user = await this.userService.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateJwtToken(user.id, user.email);
  }

  private generateJwtToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
