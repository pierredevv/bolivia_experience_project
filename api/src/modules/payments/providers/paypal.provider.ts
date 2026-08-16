import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  PaymentProvider,
  CreatePaymentIntentParams,
  CreatePaymentIntentResult,
  CaptureResult,
  PaymentWebhookContext,
  PaymentProviderName,
  PaymentCurrency,
} from "./payment-provider.interface";

/**
 * Proveedor de pago PayPal (Checkout Orders v2).
 *
 * Flujo:
 *  1. createPaymentIntent -> crea una orden (POST /v2/checkout/orders) y devuelve
 *     el link de aprobación (payUrl) para redirigir al usuario.
 *  2. El usuario aprueba en PayPal -> evento CHECKOUT.ORDER.APPROVED (webhook) o
 *     retrieve en /confirm.
 *  3. Se captura la orden (POST /v2/checkout/orders/{id}/capture) -> se obtiene el
 *     captureId, que se guarda en payment.transactionId y se usa para refunds.
 *  4. PAYMENT.CAPTURE.COMPLETED confirma el cargo.
 *
 * La API REST se consume directamente con fetch (sin SDK) para evitar dependencias.
 */
@Injectable()
export class PayPalProvider implements PaymentProvider {
  readonly name: PaymentProviderName = "paypal";
  private readonly logger = new Logger(PayPalProvider.name);

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly webhookId: string;
  private readonly baseUrl: string;

  /** Cache de access token con timestamp de expiración. */
  private accessToken: { token: string; expiresAt: number } | null = null;

  constructor(private config: ConfigService) {
    this.clientId = this.config.get<string>("PAYPAL_CLIENT_ID") ?? "";
    this.clientSecret = this.config.get<string>("PAYPAL_CLIENT_SECRET") ?? "";
    this.webhookId = this.config.get<string>("PAYPAL_WEBHOOK_ID") ?? "";
    const mode = this.config.get<string>("PAYPAL_MODE") ?? "sandbox";
    this.baseUrl =
      mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  }

  async isEnabled(): Promise<boolean> {
    return (
      !!this.clientId &&
      !this.clientId.includes("PLACEHOLDER") &&
      !!this.clientSecret &&
      !this.clientSecret.includes("PLACEHOLDER")
    );
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.accessToken.expiresAt > Date.now()) {
      return this.accessToken.token;
    }
    const basic = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      "base64",
    );
    const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`PayPal token error (${res.status}): ${text}`);
    }
    const data = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };
    this.accessToken = {
      token: data.access_token,
      // margen de seguridad de 60s
      expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };
    return this.accessToken.token;
  }

  private async paypalFetch(
    path: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    body?: unknown,
  ): Promise<any> {
    const token = await this.getAccessToken();
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text().catch(() => "");
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) {
      throw new Error(`PayPal ${method} ${path} error (${res.status})`);
    }
    return data;
  }

  private usdAmount(amount: number): string {
    return (amount / 100).toFixed(2);
  }

  async createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<CreatePaymentIntentResult> {
    if (params.currency !== "USD") {
      throw new Error("PayPal solo soporta USD");
    }
    const order = await this.paypalFetch("/v2/checkout/orders", "POST", {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.metadata.paymentId ?? undefined,
          custom_id: params.metadata.paymentId ?? undefined,
          invoice_id: params.idempotencyKey.slice(0, 127),
          description: params.description,
          amount: {
            currency_code: "USD",
            value: this.usdAmount(params.amountCents),
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: this.usdAmount(params.amountCents),
              },
            },
          },
        },
      ],
      application_context: {
        user_action: "PAY_NOW",
        brand_name: "BoliviaExperience",
      },
    });

    const approveLink = (order.links ?? []).find(
      (l: any) => l.rel === "approve",
    )?.href;

    return {
      providerTransactionId: order.id,
      payUrl: approveLink,
      currency: "USD",
    };
  }

  async retrievePaymentIntent(providerTransactionId: string): Promise<{
    status: string;
    paymentMethodType?: string;
  }> {
    const order = await this.paypalFetch(
      `/v2/checkout/orders/${encodeURIComponent(providerTransactionId)}`,
      "GET",
    );
    return { status: this.mapOrderStatus(order.status) };
  }

  async capture(providerTransactionId: string): Promise<CaptureResult> {
    await this.paypalFetch(
      `/v2/checkout/orders/${encodeURIComponent(providerTransactionId)}/capture`,
      "POST",
    );
    // Re-consultar la orden para leer los capture ids.
    const order = await this.paypalFetch(
      `/v2/checkout/orders/${encodeURIComponent(providerTransactionId)}`,
      "GET",
    );
    let captureId: string | undefined;
    for (const unit of order.purchase_units ?? []) {
      const captures = unit.payments?.captures ?? [];
      if (captures.length > 0) captureId = captures[0].id;
    }
    return {
      providerTransactionId,
      captureId,
      status: this.mapOrderStatus(order.status),
    };
  }

  async refund(providerTransactionId: string, amountCents?: number): Promise<void> {
    // Primero capturar el captureId (si es una order id) para poder reembolsarla.
    const captureId = await this.resolveCaptureId(providerTransactionId);
    const body: any = {
      ...(amountCents != null
        ? { amount: { currency_code: "USD", value: this.usdAmount(amountCents) } }
        : {}),
    };
    await this.paypalFetch(
      `/v2/payments/captures/${encodeURIComponent(captureId)}/refund`,
      "POST",
      Object.keys(body).length ? body : undefined,
    );
  }

  private async resolveCaptureId(providerTransactionId: string): Promise<string> {
    const order = await this.paypalFetch(
      `/v2/checkout/orders/${encodeURIComponent(providerTransactionId)}`,
      "GET",
    );
    for (const unit of order.purchase_units ?? []) {
      const captures = unit.payments?.captures ?? [];
      if (captures.length > 0) return captures[0].id;
    }
    throw new Error(
      `No hay capture disponible para ${providerTransactionId} (¿la orden está capturada?)`,
    );
  }

  private mapOrderStatus(status: string): string {
    switch (status) {
      case "COMPLETED":
        return "succeeded";
      case "APPROVED":
        return "approved";
      case "PAYER_ACTION_REQUIRED":
        return "requires_action";
      case "CREATED":
        return "pending";
      case "SAVED":
        return "pending";
      case "VOIDED":
        return "cancelled";
      default:
        return status.toLowerCase();
    }
  }

  async verifyWebhookSignature(ctx: PaymentWebhookContext): Promise<boolean> {
    if (!this.webhookId || this.webhookId.includes("PLACEHOLDER")) {
      return false;
    }
    const body = JSON.stringify({
      auth_algo: ctx.headers?.["paypal-auth-algo"] ?? null,
      cert_url: ctx.headers?.["paypal-cert-url"] ?? null,
      transmission_id: ctx.headers?.["paypal-transmission-id"] ?? null,
      transmission_sig: ctx.headers?.["paypal-transmission-sig"] ?? null,
      transmission_time: ctx.headers?.["paypal-transmission-time"] ?? null,
      webhook_id: this.webhookId,
      webhook_event: JSON.parse(Buffer.from(ctx.bytes).toString("utf8")),
    });

    try {
      const res = await fetch(
        `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await this.getAccessToken()}`,
            "Content-Type": "application/json",
          },
          body,
        },
      );
      if (!res.ok) return false;
      const data = await res.json();
      return data.verification_status === "SUCCESS";
    } catch (e) {
      this.logger.warn(`verifyWebhookSignature error: ${(e as Error).message}`);
      return false;
    }
  }
}
