import { registerAs } from '@nestjs/config';

/**
 * M-Pesa Daraja API Configuration Interface
 */
export interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  businessShortCode: string;
  passkey: string;
  callbackUrl: string;
  environment: 'sandbox' | 'production';
  apiUrl: string;
}

/**
 * M-Pesa configuration factory
 * Loads configuration from environment variables with validation
 */
export default registerAs('mpesa', (): MpesaConfig => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const businessShortCode = process.env.MPESA_BUSINESS_SHORT_CODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  const environment = (process.env.MPESA_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production';
  const apiUrl = process.env.MPESA_API_URL || 'https://sandbox.safaricom.co.ke';

  // Validate required configuration
  if (!consumerKey) {
    throw new Error('MPESA_CONSUMER_KEY environment variable is required');
  }
  if (!consumerSecret) {
    throw new Error('MPESA_CONSUMER_SECRET environment variable is required');
  }
  if (!businessShortCode) {
    throw new Error('MPESA_BUSINESS_SHORT_CODE environment variable is required');
  }
  if (!passkey) {
    throw new Error('MPESA_PASSKEY environment variable is required');
  }
  if (!callbackUrl) {
    throw new Error('MPESA_CALLBACK_URL environment variable is required');
  }

  // Validate environment value
  if (environment !== 'sandbox' && environment !== 'production') {
    throw new Error('MPESA_ENVIRONMENT must be either "sandbox" or "production"');
  }

  return {
    consumerKey,
    consumerSecret,
    businessShortCode,
    passkey,
    callbackUrl,
    environment,
    apiUrl,
  };
});

/**
 * Helper function to get M-Pesa configuration
 * Used for dependency injection
 */
export const MPESA_CONFIG = 'mpesa';
