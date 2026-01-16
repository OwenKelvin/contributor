import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import mpesaConfig from '../mpesa.config';
import { MpesaAuthService } from './mpesa-auth.service';
import {
  MpesaReversalRequestDto,
  MpesaReversalResponseDto,
} from '../dto/mpesa-reversal.dto';

/**
 * M-Pesa Reversal Service
 * Handles transaction reversals (refunds) for M-Pesa payments
 */
@Injectable()
export class MpesaReversalService {
  private readonly logger = new Logger(MpesaReversalService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: MpesaAuthService,
    @Inject(mpesaConfig.KEY)
    private readonly config: ConfigType<typeof mpesaConfig>
  ) {}

  /**
   * Initiate transaction reversal (refund)
   * @param transactionId - The original M-Pesa receipt number (MpesaReceiptNumber)
   * @param amount - The amount to reverse
   * @param reason - Reason for the reversal
   * @returns Reversal response
   */
  async initiateReversal(
    transactionId: string,
    amount: number,
    reason: string
  ): Promise<MpesaReversalResponseDto> {
    try {
      const accessToken = await this.authService.getAccessToken();

      // Note: In production, you need to generate SecurityCredential
      // This requires encrypting the initiator password with M-Pesa public key
      // For now, we'll use a placeholder - this needs to be implemented properly
      const securityCredential = await this.generateSecurityCredential();

      const requestBody: MpesaReversalRequestDto = {
        Initiator: 'apitest', // Replace with actual initiator name from M-Pesa portal
        SecurityCredential: securityCredential,
        CommandID: 'TransactionReversal',
        TransactionID: transactionId,
        Amount: Math.round(amount), // M-Pesa requires integer amount
        ReceiverParty: this.config.businessShortCode,
        RecieverIdentifierType: '11', // 11 = Till Number, 4 = Paybill
        ResultURL: `${this.config.callbackUrl}/reversal`,
        QueueTimeOutURL: `${this.config.callbackUrl}/reversal/timeout`,
        Remarks: reason.substring(0, 100), // M-Pesa has a 100 character limit
        Occasion: 'Refund',
      };

      this.logger.debug(
        `Initiating reversal for transaction ${transactionId}, amount ${amount}`
      );

      const url = `${this.config.apiUrl}/mpesa/reversal/v1/request`;

      const response = await firstValueFrom(
        this.httpService.post<MpesaReversalResponseDto>(url, requestBody, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
      );

      const data = response.data;

      if (data.ResponseCode === '0') {
        this.logger.log(
          `Reversal initiated successfully. ConversationID: ${data.ConversationID}`
        );
      } else {
        this.logger.warn(
          `Reversal failed with code ${data.ResponseCode}: ${data.ResponseDescription}`
        );
      }

      return data;
    } catch (error) {
      this.logger.error(
        `Failed to initiate reversal for transaction ${transactionId}`,
        error
      );

      // Extract error details from M-Pesa response if available
      if (error.response?.data) {
        const errorData = error.response.data;
        return {
          ResponseCode: errorData.errorCode || '1',
          ResponseDescription: errorData.errorMessage || 'Reversal failed',
          errorCode: errorData.errorCode,
          errorMessage: errorData.errorMessage,
        };
      }

      throw new Error('Failed to initiate M-Pesa reversal');
    }
  }

  /**
   * Generate security credential for reversal
   * 
   * IMPORTANT: This is a placeholder implementation
   * In production, you must:
   * 1. Get the initiator password from secure storage
   * 2. Download M-Pesa public certificate from the portal
   * 3. Encrypt the password using the certificate
   * 4. Base64 encode the encrypted result
   * 
   * Example implementation:
   * ```
   * const crypto = require('crypto');
   * const fs = require('fs');
   * 
   * const publicKey = fs.readFileSync('mpesa_public_cert.cer');
   * const buffer = Buffer.from(initiatorPassword);
   * const encrypted = crypto.publicEncrypt(
   *   {
   *     key: publicKey,
   *     padding: crypto.constants.RSA_PKCS1_PADDING,
   *   },
   *   buffer
   * );
   * return encrypted.toString('base64');
   * ```
   */
  private async generateSecurityCredential(): Promise<string> {
    // TODO: Implement proper security credential generation
    // For sandbox testing, M-Pesa provides a test credential
    // For production, this MUST be properly implemented
    
    this.logger.warn(
      'Using placeholder security credential. Implement proper credential generation for production!'
    );

    // Sandbox test credential (this won't work in production)
    return 'Safaricom999!*!';
  }

  /**
   * Handle reversal callback
   * This should be called by the callback controller when M-Pesa sends the result
   * @param callbackData - The callback data from M-Pesa
   */
  handleReversalCallback(callbackData: any): void {
    const { ResultCode, ResultDesc, ConversationID, TransactionID } =
      callbackData.Result;

    if (ResultCode === 0) {
      this.logger.log(
        `Reversal successful for ConversationID: ${ConversationID}, TransactionID: ${TransactionID}`
      );
      // Emit success event here
    } else {
      this.logger.error(
        `Reversal failed for ConversationID: ${ConversationID}. Code: ${ResultCode}, Desc: ${ResultDesc}`
      );
      // Emit failure event here
    }
  }
}
