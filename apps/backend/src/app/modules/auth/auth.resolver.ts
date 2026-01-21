import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import {
  RequestPasswordResetInput,
  ResetPasswordInput,
} from './dto/password-reset.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../user/user.model';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { AuthResponse } from './types/auth-response.type'; // Assuming this file exists and defines AuthResponse

@Resolver()
export class AuthResolver {
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
  ): Promise<boolean> {
    return this.authService.resetPassword(
      resetPasswordInput.token,
      resetPasswordInput.newPassword,
    );
  }

  // Example of a protected route
  // @Mutation(() => String)
  // @Roles(RoleList.Admin)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // async testProtectedRoute(@CurrentUser() user: User) {
  //   return `Hello ${user.email}, you are authenticated and have the role: ${user.roles.map(role => role.name).join(', ')}!`;
  // }
}
