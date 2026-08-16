import {
  Controller,
  Post,
  Param,
  Headers,
  Req,
  HttpCode,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { PaymentsService } from "./payments.service";
import { PaymentProviderRegistry } from "./providers/payment-provider-registry.service";

@Controller("payments/webhook")
export class PaymentWebhookController {
  constructor(
    private prisma: PrismaService,
    private payments: PaymentsService,
    private registry: PaymentProviderRegistry,
  ) {}

  private rawBody(req: Request): Buffer {
    const raw = (req as any).rawBody;
    if (!raw) {
      // Fallback: reintentar con el body ya serializado (no ideal para firma).
      return Buffer.from(JSON.stringify((req as any).body ?? {}));
    }
    return Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
  }

  @Post(":provider")
  @HttpCode(200)
  async handle(
    @Param("provider") provider: string,
    @Headers("stripe-signature") stripeSignature: string | undefined,
    @Req() req: Request,
  ) {
    const bytes = this.rawBody(req);
    let payloadString = bytes.toString("utf8");
    let signature = stripeSignature ?? null;

    if (provider === "stripe" && !signature) {
      payloadString = JSON.stringify((req as any).body ?? {});
    }

    const providerInst = await this.registry
      .getProvider(provider)
      .catch(() => null);
    if (!providerInst) {
      throw new HttpException(
        "Proveedor deshabilitado o desconocido",
        HttpStatus.BAD_REQUEST,
      );
    }

    // Registrar SIEMPRE el evento, sea procesado o no (auditoría).
    let parsedEvent: any = null;
    try {
      parsedEvent = JSON.parse(payloadString);
    } catch {
      parsedEvent = null;
    }

    const webhookEvent = await this.prisma.paymentWebhookEvent.create({
      data: {
        provider,
        eventType:
          provider === "paypal"
            ? parsedEvent?.event_type ?? "unknown"
            : parsedEvent?.type ?? "unknown",
        eventId: parsedEvent?.id ?? null,
        payload: payloadString,
        signatureValid: false,
      },
    });

    const valid = await providerInst.verifyWebhookSignature({
      bytes,
      signature,
      headers: req.headers as Record<string, string>,
    });

    if (!valid) {
      await this.prisma.paymentWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: { signatureValid: false, failureReason: "Firma inválida" },
      });
      throw new HttpException(
        "Firma de webhook inválida",
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.paymentWebhookEvent.update({
      where: { id: webhookEvent.id },
      data: { signatureValid: true },
    });

    const eventType =
      provider === "paypal"
        ? parsedEvent?.event_type ?? ""
        : parsedEvent?.type ?? "";
    if (!eventType) {
      await this.prisma.paymentWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: { processedAt: new Date(), failureReason: "Evento sin tipo" },
      });
      return { received: true };
    }

    await this.processEvent(provider, parsedEvent, webhookEvent.id);

    return { received: true };
  }

  private async processEvent(
    provider: string,
    event: any,
    webhookEventId: string,
  ) {
    try {
      if (provider === "stripe") {
        await this.processStripeEvent(event);
      } else if (provider === "paypal") {
        await this.processPayPalEvent(event);
      }
      await this.prisma.paymentWebhookEvent.update({
        where: { id: webhookEventId },
        data: { processedAt: new Date() },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error procesando evento";
      await this.prisma.paymentWebhookEvent.update({
        where: { id: webhookEventId },
        data: { processedAt: new Date(), failureReason: message },
      });
    }
  }

  private async processStripeEvent(event: any) {
    const type: string = event?.type ?? "";
    const object = event?.data?.object;

    if (type === "payment_intent.succeeded") {
      const piId = object?.id;
      if (piId) {
        await this.payments.markHeldByProviderTransactionId(piId);
      }
    }
    // charge.dispute.created -> se conecta en Fase E/Módulo 7
  }

  /**
   * PayPal Checkout (Orders v2):
   *  - CHECKOUT.ORDER.APPROVED -> el comprador aprobó: capturamos explícitamente
   *    la orden y guardamos el captureId (necesario para reembolsos).
   *  - PAYMENT.CAPTURE.COMPLETED -> refuerza/confirma el cargo ya capturado.
   * (resource.id es el order id; en CAPTURE.COMPLETED la orden está en
   *  resource.supplementary_data.related_ids.order_id)
   */
  private async processPayPalEvent(event: any) {
    const type: string = event?.event_type ?? "";
    const resource = event?.resource;

    if (type === "CHECKOUT.ORDER.APPROVED") {
      const orderId = resource?.id;
      if (!orderId) return;
      const provider = await this.registry.getProvider("paypal");
      const captured = await provider.capture?.(orderId);
      if (captured?.captureId) {
        await this.prisma.payment.updateMany({
          where: { providerTransactionId: orderId },
          data: { transactionId: captured.captureId },
        });
      }
      await this.payments.markHeldByProviderTransactionId(orderId);
      return;
    }

    if (type === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId =
        resource?.supplementary_data?.related_ids?.order_id ?? resource?.id;
      if (!orderId) return;
      if (resource?.id) {
        await this.prisma.payment.updateMany({
          where: { providerTransactionId: orderId },
          data: { transactionId: resource.id },
        });
      }
      await this.payments.markHeldByProviderTransactionId(orderId);
      return;
    }
    // PAYMENT.CAPTURE.REFUNDED / REVERSED -> se conecta en Fase D (reembolsos).
  }
}
