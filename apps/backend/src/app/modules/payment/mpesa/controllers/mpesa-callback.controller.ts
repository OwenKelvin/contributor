import { Controller, Post, Body, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  MpesaCallbackDto,
  ParsedCallbackData,
  CallbackMetadataItem,
} from '../dto/mpesa-callback.dto';
import { MpesaReversalCallbackDto } from '../dto/mpesa-reversal.dto';

/**
 * M-Pesa Callback Controller
 * Handles callbacks from M-Pesa Daraja API
 */
@Controller('api/payment/mpesa')
export class MpesaCallbackController {
  private readonly logger = new Logger(MpesaCallbackController.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Handle STK Push callback
   * M-Pesa sends payment results to this endpoint
   */
  @Post('callback')
  async handleStkCallback(@Body() callbackDto: MpesaCallbackDto) {
    try {
      this.logger.log('Received M-Pesa STK callback');
      this.logger.debug(`Callback data: ${JSON.stringify(callbackDto)}`);

      const stkCallback = callbackDto.Body.stkCallback;
      const parsedData = this.parseCallbackData(stkCallback);

      // Check result code
      // 0 = Success
      // 1032 = User cancelled
      // Other codes = Various failures
      if (parsedData.resultCode === 0) {
        this.logger.log(
          `Payment successful. CheckoutRequestID: ${parsedData.checkoutRequestId}, Receipt: ${parsedData.mpesaReceiptNumber}`
        );

        // Emit payment success event
        this.eventEmitter.emit('payment.success', parsedData);
      } else {
        this.logger.warn(
          `Payment failed. CheckoutRequestID: ${parsedData.checkoutRequestId}, Code: ${parsedData.resultCode}, Desc: ${parsedData.resultDesc}`
        );

        // Emit payment failure event
        this.eventEmitter.emit('payment.failure', parsedData);
      }

      // Return success response to M-Pesa
      return {
        ResultCode: 0,
        ResultDesc: 'Accepted',
      };
    } catch (error) {
      this.logger.error('Error processing M-Pesa callback', error);

      // Still return success to M-Pesa to avoid retries
      // Log the error for manual investigation
      return {
        ResultCode: 0,
        ResultDesc: 'Accepted',
      };
    }
  }

  /**
   * Handle reversal callback
   * M-Pesa sends reversal results to this endpoint
   */
  @Post('callback/reversal')
  async handleReversalCallback(@Body() callbackDto: MpesaReversalCallbackDto) {
    try {
      this.logger.log('Received M-Pesa reversal callback');
      this.logger.debug(`Callback data: ${JSON.stringify(callbackDto)}`);

      const result = callbackDto.Result;

      if (result.ResultCode === 0) {
        this.logger.log(
          `Reversal successful. ConversationID: ${result.ConversationID}, TransactionID: ${result.TransactionID}`
        );

        // Emit refund success event
        this.eventEmitter.emit('refund.success', {
          conversationId: result.ConversationID,
          originatorConversationId: result.OriginatorConversationID,
          transactionId: result.TransactionID,
          resultDesc: result.ResultDesc,
        });
      } else {
        this.logger.error(
          `Reversal failed. ConversationID: ${result.ConversationID}, Code: ${result.ResultCode}, Desc: ${result.ResultDesc}`
        );

        // Emit refund failure event
        this.eventEmitter.emit('refund.failure', {
          conversationId: result.ConversationID,
          originatorConversationId: result.OriginatorConversationID,
          resultCode: result.ResultCode,
          resultDesc: result.ResultDesc,
        });
      }

      // Return success response to M-Pesa
      return {
        ResultCode: 0,
        ResultDesc: 'Accepted',
      };
    } catch (error) {
      this.logger.error('Error processing M-Pesa reversal callback', error);

      // Still return success to M-Pesa to avoid retries
      return {
        ResultCode: 0,
        ResultDesc: 'Accepted',
      };
    }
  }

  /**
   * Handle reversal timeout callback
   * M-Pesa sends timeout notifications to this endpoint
   */
  @Post('callback/reversal/timeout')
  async handleReversalTimeout(@Body() callbackDto: any) {
    this.logger.warn('Received M-Pesa reversal timeout callback');
    this.logger.debug(`Timeout data: ${JSON.stringify(callbackDto)}`);

    // Emit timeout event for handling
    this.eventEmitter.emit('refund.timeout', callbackDto);

    return {
      ResultCode: 0,
      ResultDesc: 'Accepted',
    };
  }

  /**
   * Parse callback metadata into structured data
   */
  private parseCallbackData(stkCallback: any): ParsedCallbackData {
    const parsedData: ParsedCallbackData = {
      merchantRequestId: stkCallback.MerchantRequestID,
      checkoutRequestId: stkCallback.CheckoutRequestID,
      resultCode: stkCallback.ResultCode,
      resultDesc: stkCallback.ResultDesc,
    };

    // Extract metadata if payment was successful
    if (stkCallback.CallbackMetadata?.Item) {
      const items: CallbackMetadataItem[] = stkCallback.CallbackMetadata.Item;

      items.forEach((item) => {
        switch (item.Name) {
          case 'Amount':
            parsedData.amount = Number(item.Value);
            break;
          case 'MpesaReceiptNumber':
            parsedData.mpesaReceiptNumber = String(item.Value);
            break;
          case 'TransactionDate':
            parsedData.transactionDate = String(item.Value);
            break;
          case 'PhoneNumber':
            parsedData.phoneNumber = String(item.Value);
            break;
        }
      });
    }

    return parsedData;
  }
}
