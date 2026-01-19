import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import * as fs from 'fs';
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
          const securityCredential = await this.generateSecurityCredential();
    
                let initiator: string;
                if (this.config.environment === 'production') {
                  if (!this.config.initiatorName) {
                    throw new Error('MPESA_INITIATOR_NAME is required in production environment.');
                  }
                  initiator = this.config.initiatorName;
                } else {
                  // Provide a default or throw an error for sandbox if not provided.
                  // For now, let's use a placeholder for sandbox.
                  initiator = this.config.initiatorName || 'apitest';
                }
          
                const requestBody: MpesaReversalRequestDto = {
                  Initiator: initiator,            SecurityCredential: securityCredential,
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
   * Generates a security credential for M-Pesa API calls.
   * For production, this implements the official Safaricom method for reversal by
   * encrypting the initiator password with the M-Pesa public key certificate.
   * For sandbox, it returns a test credential.
   *
   * @private
   * @returns {Promise<string>} The generated security credential.
   * @throws {Error} If required environment variables are not set for production or if the certificate cannot be read.
   */
  private async generateSecurityCredential(): Promise<string> {
    if (this.config.environment !== 'production') {
      this.logger.warn(
        'Using placeholder security credential for sandbox environment.'
      );
      return 'Safaricom999!*!';
    }

    this.logger.log('Generating security credential for production environment.');

    const initiatorPassword = this.config.initiatorPassword;
    const certificatePath = this.config.securityCertificatePath;

    if (!initiatorPassword || !certificatePath) {
      throw new Error(
        'MPESA_INITIATOR_PASSWORD and MPESA_SECURITY_CERTIFICATE_PATH are required for production.'
      );
    }

    try {
      const certificate = fs.readFileSync(certificatePath);
      const encryptedPassword = crypto.publicEncrypt(
        {
          key: certificate,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        Buffer.from(initiatorPassword)
      );
      return encryptedPassword.toString('base64');
    } catch (error) {
      this.logger.error(
        `Failed to generate security credential. Check certificate path and permissions. Path: ${certificatePath}`,
        error
      );
      throw new Error('Could not generate security credential.');
    }
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
