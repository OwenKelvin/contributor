import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import mpesaConfig from '../mpesa.config';
import { MpesaAuthService } from './mpesa-auth.service';
import {
  MpesaStkPushRequestDto,
  MpesaStkPushResponseDto,
} from '../dto/mpesa-stk-push.dto';
import { PaymentDetails } from '../../interfaces/payment-gateway.interface';

/**
 * M-Pesa STK Push Service
 * Handles Lipa Na M-Pesa Online (STK Push) payment initiation
 */
@Injectable()
export class MpesaStkService {
  private readonly logger = new Logger(MpesaStkService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: MpesaAuthService,
    @Inject(mpesaConfig.KEY)
    private readonly config: ConfigType<typeof mpesaConfig>
  ) {}

  /**
   * Initiate STK Push payment
   * @param paymentDetails - Payment details including amount and phone number
   * @returns STK Push response with CheckoutRequestID
   */
  async initiateStkPush(
    paymentDetails: PaymentDetails
  ): Promise<MpesaStkPushResponseDto> {
    try {
      const accessToken = await this.authService.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      // Format phone number (ensure it starts with 254)
      const phoneNumber = this.formatPhoneNumber(paymentDetails.phoneNumber);

      const requestBody: MpesaStkPushRequestDto = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(paymentDetails.amount), // M-Pesa requires integer amount
        PartyA: phoneNumber,
        PartyB: this.config.businessShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: this.config.callbackUrl,
        AccountReference: paymentDetails.accountReference,
        TransactionDesc: paymentDetails.transactionDesc || 'Payment',
      };

      this.logger.debug(
        `Initiating STK Push for phone ${phoneNumber}, amount ${paymentDetails.amount}`
      );

      const url = `${this.config.apiUrl}/mpesa/stkpush/v1/processrequest`;

      const response = await firstValueFrom(
        this.httpService.post<MpesaStkPushResponseDto>(url, requestBody, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
      );

      const data = response.data;

      if (data.ResponseCode === '0') {
        this.logger.log(
          `STK Push initiated successfully. CheckoutRequestID: ${data.CheckoutRequestID}`
        );
      } else {
        this.logger.warn(
          `STK Push failed with code ${data.ResponseCode}: ${data.ResponseDescription}`
        );
      }

      return data;
    } catch (error) {
      this.logger.error('Failed to initiate STK Push', error);
      
      // Extract error details from M-Pesa response if available
      if (error.response?.data) {
        const errorData = error.response.data;
        return {
          ResponseCode: errorData.errorCode || '1',
          ResponseDescription: errorData.errorMessage || 'STK Push failed',
          errorCode: errorData.errorCode,
          errorMessage: errorData.errorMessage,
        };
      }

      throw new Error('Failed to initiate M-Pesa STK Push');
    }
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
   * Generate password for STK Push
   * Password = Base64(Shortcode + Passkey + Timestamp)
   */
  private generatePassword(timestamp: string): string {
    const str = `${this.config.businessShortCode}${this.config.passkey}${timestamp}`;
    return Buffer.from(str).toString('base64');
  }

  /**
   * Format phone number to M-Pesa format (254XXXXXXXXX)
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any spaces, dashes, or plus signs
    let formatted = phoneNumber.replace(/[\s\-+]/g, '');

    // If starts with 0, replace with 254
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.substring(1);
    }

    // If starts with 7 or 1, add 254 prefix
    if (formatted.startsWith('7') || formatted.startsWith('1')) {
      formatted = '254' + formatted;
    }

    // Validate format
    if (!/^254\d{9}$/.test(formatted)) {
      throw new Error(
        `Invalid phone number format: ${phoneNumber}. Expected format: 254XXXXXXXXX`
      );
    }

    return formatted;
  }
}
