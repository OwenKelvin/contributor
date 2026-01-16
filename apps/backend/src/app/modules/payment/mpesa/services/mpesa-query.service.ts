import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import mpesaConfig from '../mpesa.config';
import { MpesaAuthService } from './mpesa-auth.service';
import {
  MpesaQueryRequestDto,
  MpesaQueryResponseDto,
} from '../dto/mpesa-query.dto';

/**
 * M-Pesa Query Service
 * Handles transaction status queries for STK Push payments
 */
@Injectable()
export class MpesaQueryService {
  private readonly logger = new Logger(MpesaQueryService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: MpesaAuthService,
    @Inject(mpesaConfig.KEY)
    private readonly config: ConfigType<typeof mpesaConfig>
  ) {}

  /**
   * Query transaction status
   * Used to check payment status when callback is delayed or missed
   * @param checkoutRequestId - The CheckoutRequestID from STK Push
   * @returns Query response with transaction status
   */
  async queryTransactionStatus(
    checkoutRequestId: string
  ): Promise<MpesaQueryResponseDto> {
    try {
      const accessToken = await this.authService.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const requestBody: MpesaQueryRequestDto = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      this.logger.debug(
        `Querying transaction status for CheckoutRequestID: ${checkoutRequestId}`
      );

      const url = `${this.config.apiUrl}/mpesa/stkpushquery/v1/query`;

      const response = await firstValueFrom(
        this.httpService.post<MpesaQueryResponseDto>(url, requestBody, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
      );

      const data = response.data;

      this.logger.debug(
        `Query response for ${checkoutRequestId}: ResultCode=${data.ResultCode}, ResultDesc=${data.ResultDesc}`
      );

      return data;
    } catch (error) {
      this.logger.error(
        `Failed to query transaction status for ${checkoutRequestId}`,
        error
      );

      // Extract error details from M-Pesa response if available
      if (error.response?.data) {
        const errorData = error.response.data;
        return {
          ResponseCode: errorData.errorCode || '1',
          ResponseDescription: errorData.errorMessage || 'Query failed',
          errorCode: errorData.errorCode,
          errorMessage: errorData.errorMessage,
        };
      }

      throw new Error('Failed to query M-Pesa transaction status');
    }
  }

  /**
   * Poll transaction status with retries
   * Useful for waiting for payment completion
   * @param checkoutRequestId - The CheckoutRequestID from STK Push
   * @param maxAttempts - Maximum number of polling attempts (default: 10)
   * @param intervalMs - Interval between attempts in milliseconds (default: 3000)
   * @returns Query response when transaction is complete or max attempts reached
   */
  async pollTransactionStatus(
    checkoutRequestId: string,
    maxAttempts: number = 10,
    intervalMs: number = 3000
  ): Promise<MpesaQueryResponseDto> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      this.logger.debug(
        `Polling attempt ${attempt}/${maxAttempts} for ${checkoutRequestId}`
      );

      const result = await this.queryTransactionStatus(checkoutRequestId);

      // Check if transaction is complete (success or failure)
      // ResultCode: 0 = Success, 1032 = Cancelled, other = Failed
      if (result.ResultCode && result.ResultCode !== '1037') {
        // 1037 = Request in progress
        this.logger.log(
          `Transaction ${checkoutRequestId} completed with ResultCode: ${result.ResultCode}`
        );
        return result;
      }

      // Wait before next attempt (except on last attempt)
      if (attempt < maxAttempts) {
        await this.sleep(intervalMs);
      }
    }

    this.logger.warn(
      `Max polling attempts reached for ${checkoutRequestId}. Transaction may still be pending.`
    );

    return {
      ResponseCode: '1',
      ResponseDescription: 'Transaction status unknown after polling',
      ResultCode: '1037',
      ResultDesc: 'Request in progress',
    };
  }

  /**
   * Generate timestamp in format YYYYMMDDHHmmss
   */
  private generateTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Generate password for query
   * Password = Base64(Shortcode + Passkey + Timestamp)
   */
  private generatePassword(timestamp: string): string {
    const str = `${this.config.businessShortCode}${this.config.passkey}${timestamp}`;
    return Buffer.from(str).toString('base64');
  }

  /**
   * Sleep utility for polling
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
