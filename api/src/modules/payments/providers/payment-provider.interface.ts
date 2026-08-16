export type PaymentProviderName = "stripe" | "paypal" | "qr_banco_local";
export type PaymentCurrency = "USD" | "BOB";

export interface CreatePaymentIntentParams {
  amountCents: number;
  currency: PaymentCurrency;
  idempotencyKey: string;
  description: string;
  metadata: Record<string, string>;
  customerName?: string;
}

export interface CreatePaymentIntentResult {
  providerTransactionId: string;
  clientSecret?: string;
  payUrl?: string;
  currency: PaymentCurrency;
}

export interface CaptureResult {
  providerTransactionId: string;
  captureId?: string;
  status: string;
}

export interface PaymentWebhookContext {
  bytes: Uint8Array;
  signature: string | null;
  headers?: Record<string, string>;
}

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  isEnabled(): Promise<boolean>;
  createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<CreatePaymentIntentResult>;
  retrievePaymentIntent(providerTransactionId: string): Promise<{
    status: string;
    paymentMethodType?: string;
  }>;
  /**
   * Captura un pago aprobado. Necesario para proveedores con captura explícita
   * (PayPal Orders). Stripe auto-captura al confirmar, por lo que es opcional.
   */
  capture?(
    providerTransactionId: string,
  ): Promise<CaptureResult>;
  refund(providerTransactionId: string, amountCents?: number): Promise<void>;
  verifyWebhookSignature(ctx: PaymentWebhookContext): Promise<boolean>;
}
