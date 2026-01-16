# Payment Module - M-Pesa Daraja 3.0 Integration

This module provides payment processing functionality using the M-Pesa Daraja API 3.0. It's configured as a global module and can be used throughout the application.

## Features

- **STK Push (Lipa Na M-Pesa Online)**: Initiate payments via mobile phone
- **Transaction Status Query**: Check payment status when callbacks are delayed
- **Transaction Reversal**: Process refunds for completed payments
- **OAuth Token Management**: Automatic token generation and caching
- **Event-Driven Architecture**: Emit events for payment success/failure
- **Callback Handling**: Process M-Pesa callbacks for payment results

## Architecture

```
payment/
├── payment.module.ts              # Main module configuration
├── index.ts                       # Public exports
├── interfaces/
│   └── payment-gateway.interface.ts  # Payment gateway contract
├── events/
│   └── payment.events.ts          # Payment event definitions
└── mpesa/
    ├── mpesa.config.ts            # M-Pesa configuration
    ├── mpesa-payment-gateway.service.ts  # Main gateway service
    ├── controllers/
    │   └── mpesa-callback.controller.ts  # Callback endpoint
    ├── services/
    │   ├── mpesa-auth.service.ts      # OAuth token management
    │   ├── mpesa-stk.service.ts       # STK Push implementation
    │   ├── mpesa-query.service.ts     # Transaction status queries
    │   └── mpesa-reversal.service.ts  # Refund processing
    └── dto/
        ├── mpesa-payment-details.dto.ts
        ├── mpesa-stk-push.dto.ts
        ├── mpesa-callback.dto.ts
        ├── mpesa-query.dto.ts
        └── mpesa-reversal.dto.ts
```

## Environment Variables

Add these variables to your `.env.local` file:

```bash
# M-Pesa Daraja API Configuration
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_BUSINESS_SHORT_CODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payment/mpesa/callback
MPESA_ENVIRONMENT=sandbox  # or 'production'
MPESA_API_URL=https://sandbox.safaricom.co.ke  # or production URL
```

### Getting M-Pesa Credentials

1. Register at [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Create a new app
3. Get your Consumer Key and Consumer Secret
4. Get your Business Short Code and Passkey from the portal
5. Configure your callback URL (must be publicly accessible)

## Usage

### 1. Import the Module

The PaymentModule is configured as a global module, so you don't need to import it in other modules. Just inject the PaymentGateway service:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { PaymentGateway, PaymentDetails } from '../payment';

@Injectable()
export class ContributionService {
  constructor(
    @Inject('PaymentGateway')
    private readonly paymentGateway: PaymentGateway
  ) {}
}
```

### 2. Process a Payment

```typescript
const paymentDetails: PaymentDetails = {
  amount: 100,
  phoneNumber: '254708374149', // Format: 254XXXXXXXXX
  accountReference: contributionId,
  transactionDesc: 'Project contribution',
};

const result = await this.paymentGateway.processPayment(
  contributionId,
  paymentDetails
);

if (result.success) {
  console.log('Payment initiated:', result.checkoutRequestId);
  // Store checkoutRequestId for tracking
} else {
  console.error('Payment failed:', result.errorMessage);
}
```

### 3. Check Payment Status

```typescript
const status = await this.paymentGateway.checkPaymentStatus(
  checkoutRequestId
);

if (status.resultCode === '0') {
  console.log('Payment successful');
} else {
  console.log('Payment failed or pending');
}
```

### 4. Process a Refund

```typescript
const refundResult = await this.paymentGateway.processRefund(
  contributionId,
  amount,
  mpesaReceiptNumber, // From successful payment callback
  'Customer requested refund'
);

if (refundResult.success) {
  console.log('Refund initiated:', refundResult.conversationId);
} else {
  console.error('Refund failed:', refundResult.errorMessage);
}
```

### 5. Listen to Payment Events

```typescript
import { OnEvent } from '@nestjs/event-emitter';
import { PAYMENT_EVENTS } from '../payment';

@Injectable()
export class ContributionService {
  @OnEvent(PAYMENT_EVENTS.PAYMENT_SUCCESS)
  async handlePaymentSuccess(data: any) {
    console.log('Payment successful:', data);
    // Update contribution status, send email, etc.
  }

  @OnEvent(PAYMENT_EVENTS.PAYMENT_FAILURE)
  async handlePaymentFailure(data: any) {
    console.log('Payment failed:', data);
    // Update contribution status, notify user, etc.
  }

  @OnEvent(PAYMENT_EVENTS.REFUND_SUCCESS)
  async handleRefundSuccess(data: any) {
    console.log('Refund successful:', data);
    // Update contribution status, send email, etc.
  }
}
```

## Callback Endpoints

The module exposes these callback endpoints:

- `POST /api/payment/mpesa/callback` - STK Push payment results
- `POST /api/payment/mpesa/callback/reversal` - Reversal results
- `POST /api/payment/mpesa/callback/reversal/timeout` - Reversal timeouts

**Important**: These endpoints must be publicly accessible for M-Pesa to send callbacks.

## Testing

### Sandbox Testing

Use these test phone numbers in sandbox:
- `254708374149`
- `254708374150`

Test amounts:
- Any amount between 1 and 70,000 KES

### Testing Callbacks Locally

Since M-Pesa needs to reach your callback URL, you have two options:

1. **Use ngrok or similar tunneling service**:
   ```bash
   ngrok http 3000
   # Update MPESA_CALLBACK_URL with the ngrok URL
   ```

2. **Deploy to a staging server** with a public URL

### Manual Testing

```bash
# Test STK Push
curl -X POST http://localhost:3000/api/contributions/process-payment \
  -H "Content-Type: application/json" \
  -d '{
    "contributionId": "uuid-here",
    "phoneNumber": "254708374149",
    "amount": 100
  }'

# Test Query
curl -X GET http://localhost:3000/api/contributions/payment-status/CHECKOUT_REQUEST_ID
```

## Error Handling

The module handles various M-Pesa error codes:

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Insufficient balance |
| 1032 | User cancelled |
| 1037 | Timeout (user cannot be reached) |
| 2001 | Wrong PIN |
| 4001 | Transaction failed |

See `mpesa-payment-gateway.service.ts` for the complete error code mapping.

## Security Considerations

1. **Never commit credentials**: Use environment variables
2. **Validate callbacks**: Consider IP whitelisting for callback endpoints
3. **Use HTTPS**: M-Pesa requires HTTPS for production callbacks
4. **Rate limiting**: Implement rate limiting on callback endpoints
5. **Audit logging**: All transactions are logged for audit trail
6. **Security Credential**: For production reversals, implement proper security credential generation (see `mpesa-reversal.service.ts`)

## Production Checklist

- [ ] Get production credentials from Safaricom
- [ ] Update `MPESA_ENVIRONMENT` to `production`
- [ ] Update `MPESA_API_URL` to production URL
- [ ] Implement proper security credential generation for reversals
- [ ] Set up HTTPS for callback URLs
- [ ] Configure IP whitelisting for callbacks
- [ ] Set up monitoring and alerting
- [ ] Test with small amounts first
- [ ] Document incident response procedures

## Troubleshooting

### Callbacks not received

1. Check that callback URL is publicly accessible
2. Verify URL is HTTPS (required for production)
3. Check M-Pesa portal for callback configuration
4. Use query API as fallback

### Authentication failures

1. Verify consumer key and secret are correct
2. Check if credentials are for correct environment (sandbox/production)
3. Clear token cache: `authService.clearCache()`

### Payment failures

1. Check phone number format (254XXXXXXXXX)
2. Verify amount is within limits (1-70,000 KES)
3. Check M-Pesa error code in response
4. Ensure user has sufficient balance

## References

- [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
- [Daraja API Documentation](https://developer.safaricom.co.ke/docs)
- [M-Pesa Response Codes](https://developer.safaricom.co.ke/docs#response-codes)
