import { IsString, IsNumber, Min } from 'class-validator';

/**
 * M-Pesa Reversal Request DTO
 */
export class MpesaReversalRequestDto {
  Initiator: string;
  SecurityCredential: string;
  CommandID: string;
  TransactionID: string;
  Amount: number;
  ReceiverParty: string;
  RecieverIdentifierType: string;
  ResultURL: string;
  QueueTimeOutURL: string;
  Remarks: string;
  Occasion: string;
}

/**
 * M-Pesa Reversal Response DTO
 */
export class MpesaReversalResponseDto {
  ConversationID?: string;
  OriginatorConversationID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  errorCode?: string;
  errorMessage?: string;
  requestId?: string;
}

/**
 * M-Pesa Reversal Callback DTO
 */
export interface ReversalResultParameter {
  Key: string;
  Value: string | number;
}

export interface ReversalResult {
  ResultType: number;
  ResultCode: number;
  ResultDesc: string;
  OriginatorConversationID: string;
  ConversationID: string;
  TransactionID: string;
  ResultParameters?: {
    ResultParameter: ReversalResultParameter[];
  };
  ReferenceData?: {
    ReferenceItem: {
      Key: string;
      Value: string;
    };
  };
}

export class MpesaReversalCallbackDto {
  Result: ReversalResult;
}
