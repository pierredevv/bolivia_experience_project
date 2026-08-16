import { Injectable, NotFoundException } from "@nestjs/common";
import { PlatformConfigService } from "../../platform-config/platform-config.service";
import { PaymentProvider, PaymentProviderName } from "./payment-provider.interface";
import { StripeProvider } from "./stripe.provider";
import { PayPalProvider } from "./paypal.provider";
import { BancoQrProvider } from "./banco-qr.provider";

@Injectable()
export class PaymentProviderRegistry {
  constructor(
    private config: PlatformConfigService,
    private stripe: StripeProvider,
    private payPal: PayPalProvider,
    private bancoQr: BancoQrProvider,
  ) {}

  private map(): Record<string, PaymentProvider> {
    return {
      stripe: this.stripe,
      paypal: this.payPal,
      qr_banco_local: this.bancoQr,
    };
  }

  /**
   * Devuelve el proveedor habilitado. Un proveedor se considera disponible si:
   *  - existe en el mapa, y
   *  - el feature flag `payments_provider_<name>_enabled` está en "true" (default por proveedor), y
   *  - el propio proveedor confirma estar configurado/activo (isEnabled).
   */
  async getProvider(name: string): Promise<PaymentProvider> {
    const provider = this.map()[name];
    if (!provider) {
      throw new NotFoundException(`Proveedor de pago desconocido: ${name}`);
    }
    const defaultFlag = provider.name === "stripe" ? "true" : "false";
    const flag =
      (await this.config.get(`payments_provider_${name}_enabled`, defaultFlag)) ===
      "true";
    if (!flag || !(await provider.isEnabled())) {
      throw new NotFoundException(
        `El proveedor de pago ${name} no está habilitado`,
      );
    }
    return provider;
  }

  async getProviderIfAvailable(name: string): Promise<PaymentProvider | null> {
    try {
      return await this.getProvider(name);
    } catch {
      return null;
    }
  }

  async listEnabled(): Promise<PaymentProviderName[]> {
    const names: PaymentProviderName[] = ["stripe", "paypal", "qr_banco_local"];
    const enabled: PaymentProviderName[] = [];
    for (const name of names) {
      if (await this.getProviderIfAvailable(name)) {
        enabled.push(name);
      }
    }
    return enabled;
  }
}
