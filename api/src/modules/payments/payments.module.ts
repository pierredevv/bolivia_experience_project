import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { PaymentWebhookController } from "./payment-webhook.controller";
import { PaymentProviderRegistry } from "./providers/payment-provider-registry.service";
import { StripeProvider } from "./providers/stripe.provider";
import { PayPalProvider } from "./providers/paypal.provider";
import { BancoQrProvider } from "./providers/banco-qr.provider";
import { PrismaModule } from "../../prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [PaymentsController, PaymentWebhookController],
  providers: [
    PaymentsService,
    PaymentProviderRegistry,
    StripeProvider,
    PayPalProvider,
    BancoQrProvider,
  ],
  exports: [PaymentsService, PaymentProviderRegistry],
})
export class PaymentsModule {}
