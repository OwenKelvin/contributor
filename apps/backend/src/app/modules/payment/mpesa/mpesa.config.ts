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
  initiatorName?: string;
  initiatorPassword?: string;
  securityCertificatePath?: string;
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
  const initiatorName = process.env.MPESA_INITIATOR_NAME;
  const initiatorPassword = process.env.MPESA_INITIATOR_PASSWORD;
  const securityCertificatePath = process.env.MPESA_SECURITY_CERTIFICATE_PATH;

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

  // Validate production-specific variables
  if (environment === 'production') {
    if (!initiatorName) {
      throw new Error(
        'MPESA_INITIATOR_NAME environment variable is required for production'
      );
    }
    if (!initiatorPassword) {
      throw new Error(
        'MPESA_INITIATOR_PASSWORD environment variable is required for production'
      );
    }
    if (!securityCertificatePath) {
      throw new Error(
        'MPESA_SECURITY_CERTIFICATE_PATH environment variable is required for production'
      );
    }
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
    initiatorName,
    initiatorPassword,
    securityCertificatePath,
  };
});

/**
 * Helper function to get M-Pesa configuration
 * Used for dependency injection
 */
export const MPESA_CONFIG = 'mpesa';
