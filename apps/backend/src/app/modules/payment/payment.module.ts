import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import mpesaConfig from './mpesa/mpesa.config';

// Services
import { MpesaAuthService } from './mpesa/services/mpesa-auth.service';
import { MpesaStkService } from './mpesa/services/mpesa-stk.service';
import { MpesaQueryService } from './mpesa/services/mpesa-query.service';
import { MpesaReversalService } from './mpesa/services/mpesa-reversal.service';
import { MpesaPaymentGatewayService } from './mpesa/mpesa-payment-gateway.service';

// Controllers
import { MpesaCallbackController } from './mpesa/controllers/mpesa-callback.controller';

/**
 * Payment Module
 * Provides payment processing functionality using M-Pesa Daraja API
 * Configured as a global module for reusability across the application
 */
@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 60000, // 60 second timeout for M-Pesa API calls
      maxRedirects: 5,
    }),
    ConfigModule.forFeature(mpesaConfig),
    EventEmitterModule.forRoot(),
  ],
  controllers: [MpesaCallbackController],
  providers: [
    // M-Pesa Services
    MpesaAuthService,
    MpesaStkService,
    MpesaQueryService,
    MpesaReversalService,
    MpesaPaymentGatewayService,
    // Provide MpesaPaymentGatewayService as 'PaymentGateway' for dependency injection
    {
      provide: 'PaymentGateway',
      useClass: MpesaPaymentGatewayService,
    },
  ],
  exports: [
    'PaymentGateway', // Export as interface name for loose coupling
    MpesaPaymentGatewayService, // Also export concrete class if needed
  ],
})
export class PaymentModule {}
