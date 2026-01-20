import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      // Handles the Google OAuth2 callback
      const user = req.user as any;
      const { accessToken } = await this.authService.socialLogin(user.email, user.firstName, user.lastName, user.picture);

      // Redirect or send token back to client
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
    } catch (error) {
      console.error('Google OAuth Callback Error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=${error.message || 'Authentication failed'}`);
    }
  }
}
