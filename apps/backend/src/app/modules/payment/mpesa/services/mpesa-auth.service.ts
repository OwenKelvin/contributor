import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import mpesaConfig from '../mpesa.config';

/**
 * M-Pesa OAuth Token Response
 */
interface OAuthTokenResponse {
  access_token: string;
  expires_in: string;
}

/**
 * Cached Token Data
 */
interface CachedToken {
  token: string;
  expiresAt: number;
}

/**
 * M-Pesa Authentication Service
 * Handles OAuth token generation and caching for Daraja API
 */
@Injectable()
export class MpesaAuthService {
  private readonly logger = new Logger(MpesaAuthService.name);
  private cachedToken: CachedToken | null = null;

  constructor(
    private readonly httpService: HttpService,
    @Inject(mpesaConfig.KEY)
    private readonly config: ConfigType<typeof mpesaConfig>
  ) {}

  /**
   * Get a valid access token
   * Returns cached token if still valid, otherwise generates a new one
   */
  async getAccessToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.cachedToken && this.isTokenValid(this.cachedToken)) {
      this.logger.debug('Using cached M-Pesa access token');
      return this.cachedToken.token;
    }

    // Generate new token
    this.logger.debug('Generating new M-Pesa access token');
    const token = await this.generateToken();
    
    return token;
  }

  /**
   * Generate a new OAuth access token from M-Pesa API
   */
  private async generateToken(): Promise<string> {
    try {
      const auth = Buffer.from(
        `${this.config.consumerKey}:${this.config.consumerSecret}`
      ).toString('base64');

      const url = `${this.config.apiUrl}/oauth/v1/generate?grant_type=client_credentials`;

      const response = await firstValueFrom(
        this.httpService.get<OAuthTokenResponse>(url, {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        })
      );

      const { access_token, expires_in } = response.data;

      // Cache the token with expiry time (subtract 60 seconds for safety margin)
      const expiresInMs = (parseInt(expires_in) - 60) * 1000;
      this.cachedToken = {
        token: access_token,
        expiresAt: Date.now() + expiresInMs,
      };

      this.logger.log('Successfully generated M-Pesa access token');
      return access_token;
    } catch (error) {
      this.logger.error('Failed to generate M-Pesa access token', error);
      throw new Error('Failed to authenticate with M-Pesa API');
    }
  }

  /**
   * Check if a cached token is still valid
   */
  private isTokenValid(cachedToken: CachedToken): boolean {
    return Date.now() < cachedToken.expiresAt;
  }

  /**
   * Clear the cached token (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cachedToken = null;
    this.logger.debug('Cleared M-Pesa token cache');
  }
}
