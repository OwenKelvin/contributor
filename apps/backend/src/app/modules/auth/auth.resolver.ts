import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../user/user.model';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { AuthResponse } from './types/auth-response.type'; // Assuming this file exists and defines AuthResponse
import { GoogleOAuthUrl } from './types/google-oauth-url.type';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async register(@Args('registerInput') registerInput: RegisterInput): Promise<AuthResponse> {
    return this.authService.register(registerInput);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('loginInput') loginInput: LoginInput): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  @Query(() => GoogleOAuthUrl, { description: 'Returns the Google OAuth initiation URL' })
  async googleOAuthUrl(): Promise<GoogleOAuthUrl> {
    return { url: `${process.env.BACKEND_URL}/auth/google` };
  }

  // Example of a protected route
  // @Mutation(() => String)
  // @Roles(RoleList.Admin)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // async testProtectedRoute(@CurrentUser() user: User) {
  //   return `Hello ${user.email}, you are authenticated and have the role: ${user.roles.map(role => role.name).join(', ')}!`;
  // }
}
