import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe = require("stripe");
import {
  PaymentProvider,
  CreatePaymentIntentParams,
  CreatePaymentIntentResult,
  PaymentWebhookContext,
  PaymentProviderName,
  PaymentCurrency,
} from "./payment-provider.interface";

@Injectable()
export class StripeProvider implements PaymentProvider {
  readonly name: PaymentProviderName = "stripe";
  private readonly client: Stripe | null;

  constructor(private config: ConfigService) {
    const sk = this.config.get<string>("STRIPE_SECRET_KEY");
    this.client = sk && !sk.includes("PLACEHOLDER") ? new Stripe(sk) : null;
  }

  async isEnabled(): Promise<boolean> {
    return this.client !== null;
  }

  private currencyLabel(currency: PaymentCurrency): Stripe.PaymentIntentCreateParams["currency"] {
    return (currency || "USD").toLowerCase() as "usd";
  }

  async createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<CreatePaymentIntentResult> {
    if (!this.client) throw new Error("Stripe no configurado");
    const intent = await this.client.paymentIntents.create(
      {
        amount: params.amountCents,
        currency: this.currencyLabel(params.currency || "USD"),
        description: params.description,
        automatic_payment_methods: { enabled: true },
        metadata: params.metadata,
      },
      { idempotencyKey: params.idempotencyKey },
    );
    return {
      providerTransactionId: intent.id,
      clientSecret: intent.client_secret ?? undefined,
      currency: (intent.currency.toUpperCase() as PaymentCurrency) || "USD",
    };
  }

  async retrievePaymentIntent(providerTransactionId: string) {
    if (!this.client) throw new Error("Stripe no configurado");
    const intent = await this.client.paymentIntents.retrieve(
      providerTransactionId,
    );
    return {
      status: intent.status,
      paymentMethodType: intent.payment_method_types?.[0],
    };
  }

  async refund(providerTransactionId: string, amountCents?: number) {
    if (!this.client) throw new Error("Stripe no configurado");
    await this.client.refunds.create({
      payment_intent: providerTransactionId,
      ...(amountCents != null ? { amount: amountCents } : {}),
    });
  }

  async verifyWebhookSignature(
    ctx: PaymentWebhookContext,
  ): Promise<boolean> {
    if (!this.client) return false;
    const secret = this.config.get<string>("STRIPE_WEBHOOK_SECRET");
    if (!secret || secret.includes("PLACEHOLDER")) return false;
    const sig = ctx.signature;
    if (!sig) return false;
    try {
      this.client.webhooks.constructEvent(
        Buffer.from(ctx.bytes),
        sig,
        secret,
      );
      return true;
    } catch {
      return false;
    }
  }
}
