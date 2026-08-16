import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { PayPalProvider } from "./paypal.provider";
import { PaymentWebhookContext } from "./payment-provider.interface";

interface Route {
  url: string;
  body: any;
  status: number;
  method: string;
}

describe("PayPalProvider", () => {
  let provider: PayPalProvider;
  let fetchMock: jest.Mock;
  let routes: Route[];

  const configMock = {
    get: jest.fn(
      (key: string) =>
        ({
          PAYPAL_CLIENT_ID: "client-id",
          PAYPAL_CLIENT_SECRET: "client-secret",
          PAYPAL_WEBHOOK_ID: "webhook-id",
          PAYPAL_MODE: "sandbox",
        })[key],
    ),
  };

  beforeEach(async () => {
    routes = [];
    fetchMock = jest.fn(async (url: string, init?: any) => {
      const method = init?.method ?? "GET";
      if (url.endsWith("/v1/oauth2/token")) {
        return {
          ok: true,
          status: 200,
          text: async () => "{}",
          json: async () => ({ access_token: "ACCESS123", expires_in: 3000 }),
        };
      }
      const route = routes.find(
        (r) => url.includes(r.url) && r.method === method,
      );
      if (!route) {
        throw new Error(`Sin stub para ${method} ${url}`);
      }
      const ok = route.status >= 200 && route.status < 300;
      return {
        ok,
        status: route.status,
        text: async () => JSON.stringify(route.body),
        json: async () => route.body,
      };
    });
    (global as any).fetch = fetchMock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayPalProvider,
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();
    provider = module.get<PayPalProvider>(PayPalProvider);
  });

  afterEach(() => {
    delete (global as any).fetch;
  });

  const stub = (url: string, body: any, method = "GET", status = 200) =>
    routes.push({ url, body, method, status });

  describe("isEnabled", () => {
    it("returns true when real keys are configured", async () => {
      expect(await provider.isEnabled()).toBe(true);
    });

    it("returns false when keys are placeholders", async () => {
      configMock.get.mockImplementationOnce(() => "sk_PLACEHOLDER");
      const disabled = new PayPalProvider(configMock as any);
      expect(await disabled.isEnabled()).toBe(false);
    });
  });

  describe("createPaymentIntent", () => {
    it("crea una orden y devuelve transaction id + approve link", async () => {
      stub(
        "/v2/checkout/orders",
        {
          id: "ORDER-1",
          status: "CREATED",
          links: [
            { rel: "self", href: "https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER-1" },
            { rel: "approve", href: "https://www.sandbox.paypal.com/checkoutnow?token=ORDER-1" },
          ],
        },
        "POST",
      );

      const result = await provider.createPaymentIntent({
        amountCents: 10000, // 100.00 USD
        currency: "USD",
        idempotencyKey: "paypal:res-1:123:abc",
        description: "Reserva",
        metadata: { paymentId: "PAY-1", reservationId: "res-1", type: "reservation" },
      });

      expect(result.providerTransactionId).toBe("ORDER-1");
      expect(result.payUrl).toContain("checkoutnow");
      expect(result.currency).toBe("USD");
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/v2/checkout/orders"),
        expect.objectContaining({ method: "POST" }),
      );
      const body = JSON.parse(fetchMock.mock.calls.at(-1)![1].body);
      expect(body.purchase_units[0].amount.value).toBe("100.00");
      expect(body.intent).toBe("CAPTURE");
    });

    it("rechaza moneda distinta a USD", async () => {
      await expect(
        provider.createPaymentIntent({
          amountCents: 10000,
          currency: "BOB",
          idempotencyKey: "k",
          description: "d",
          metadata: {},
        }),
      ).rejects.toThrow("solo soporta USD");
    });
  });

  describe("retrievePaymentIntent", () => {
    it("mapea COMPLETED -> succeeded", async () => {
      stub("/v2/checkout/orders/ORDER-1", { status: "COMPLETED" });
      const r = await provider.retrievePaymentIntent("ORDER-1");
      expect(r.status).toBe("succeeded");
    });

    it("mapea PAYER_ACTION_REQUIRED -> requires_action", async () => {
      stub("/v2/checkout/orders/ORDER-1", { status: "PAYER_ACTION_REQUIRED" });
      const r = await provider.retrievePaymentIntent("ORDER-1");
      expect(r.status).toBe("requires_action");
    });
  });

  describe("capture", () => {
    it("captura la orden y devuelve el captureId", async () => {
      stub("/v2/checkout/orders/ORDER-1/capture", { status: "COMPLETED" }, "POST");
      stub("/v2/checkout/orders/ORDER-1", {
        status: "COMPLETED",
        purchase_units: [
          {
            payments: { captures: [{ id: "CAPTURE-1" }] },
          },
        ],
      });

      const result = await provider.capture("ORDER-1");
      expect(result.captureId).toBe("CAPTURE-1");
      expect(result.status).toBe("succeeded");
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/v2/checkout/orders/ORDER-1/capture"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("refund", () => {
    it("resuelve el capture y ejecuta el reembolso", async () => {
      stub("/v2/checkout/orders/ORDER-1", {
        status: "COMPLETED",
        purchase_units: [
          { payments: { captures: [{ id: "CAPTURE-1" }] } },
        ],
      });
      stub("/v2/payments/captures/CAPTURE-1/refund", { status: "COMPLETED" }, "POST");

      await provider.refund("ORDER-1", 5000);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/v2/payments/captures/CAPTURE-1/refund"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("verifyWebhookSignature", () => {
    it("devuelve true cuando la verificación es SUCCESS", async () => {
      stub(
        "/v1/notifications/verify-webhook-signature",
        { verification_status: "SUCCESS" },
        "POST",
      );

      const ctx: PaymentWebhookContext = {
        bytes: Buffer.from('{"event_type":"PAYMENT.CAPTURE.COMPLETED"}'),
        signature: null,
        headers: {
          "paypal-auth-algo": "SHA256withRSA",
          "paypal-cert-url": "https://api-m.sandbox.paypal.com/cert",
          "paypal-transmission-id": "t-1",
          "paypal-transmission-sig": "sig",
          "paypal-transmission-time": "2024-01-01T00:00:00Z",
        },
      };

      expect(await provider.verifyWebhookSignature(ctx)).toBe(true);
    });

    it("devuelve false ante un mal request", async () => {
      stub(
        "/v1/notifications/verify-webhook-signature",
        { verification_status: "FAILURE" },
        "POST",
      );
      const ctx: PaymentWebhookContext = {
        bytes: Buffer.from("{}"),
        signature: null,
        headers: {},
      };
      expect(await provider.verifyWebhookSignature(ctx)).toBe(false);
    });
  });
});
