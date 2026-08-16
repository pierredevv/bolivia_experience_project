import { Injectable } from "@nestjs/common";
import {
  PaymentProvider,
  CreatePaymentIntentParams,
  CreatePaymentIntentResult,
  PaymentWebhookContext,
  PaymentProviderName,
} from "./payment-provider.interface";

/**
 * Proveedor concreto del QR del banco local.
 *
 * ESTADO ACTUAL (Fase D pendiente): la API del banco está en trámite, por lo que
 * este proveedor está deshabilitado y lanza un error descriptivo si se intenta
 * usar. Cuando llegue el acceso (claves + documentación) se completa esta
 * implementación sin tocar el resto del sistema (Fase A garantiza el desacople).
 */
@Injectable()
export class BancoQrProvider implements PaymentProvider {
  readonly name: PaymentProviderName = "qr_banco_local";

  async isEnabled(): Promise<boolean> {
    return false; // deshabilitado hasta completar la Fase D
  }

  async createPaymentIntent(
    _params: CreatePaymentIntentParams,
  ): Promise<CreatePaymentIntentResult> {
    throw new Error(
      "El pago con QR del banco local aún no está disponible. La API del banco está en trámite (Fase D).",
    );
  }

  async retrievePaymentIntent(_providerTransactionId: string): Promise<{
    status: string;
    paymentMethodType?: string;
  }> {
    throw new Error("QR banco local no disponible (Fase D pendiente)");
  }

  async refund(_providerTransactionId: string, _amountCents?: number) {
    throw new Error("QR banco local no disponible (Fase D pendiente)");
  }

  async verifyWebhookSignature(_ctx: PaymentWebhookContext): Promise<boolean> {
    return false;
  }
}
