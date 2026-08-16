import { Test, TestingModule } from "@nestjs/testing";
import { BancoQrProvider } from "./banco-qr.provider";

describe("BancoQrProvider (QR banco local)", () => {
  let provider: BancoQrProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BancoQrProvider],
    }).compile();
    provider = module.get<BancoQrProvider>(BancoQrProvider);
  });

  it("debe exponer el nombre qr_banco_local", () => {
    expect(provider.name).toBe("qr_banco_local");
  });

  it("debe estar deshabilitado mientras no haya acceso a la API del banco", async () => {
    expect(await provider.isEnabled()).toBe(false);
  });

  it("debe lanzar un error descriptivo en createPaymentIntent", async () => {
    await expect(
      provider.createPaymentIntent({
        amountCents: 15000,
        currency: "BOB",
        idempotencyKey: "qr:k",
        description: "Reserva",
        metadata: {},
      }),
    ).rejects.toThrow("no está disponible");
  });

  it("debe rechazar un webhook cuyo proveedor no puede validar firma", async () => {
    expect(
      await provider.verifyWebhookSignature({
        bytes: new Uint8Array([1, 2, 3]),
        signature: null,
      }),
    ).toBe(false);
  });
});
