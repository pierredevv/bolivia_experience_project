import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { PaymentProviderRegistry } from "./providers/payment-provider-registry.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CreatePaymentDto } from "./dto";

@ApiTags("payments")
@Controller("payments")
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly registry: PaymentProviderRegistry,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a payment (payment method)" })
  async create(
    @CurrentUser("id") userId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(userId, dto);
  }

  @Get("available-providers")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List enabled payment providers" })
  async availableProviders() {
    return this.registry.listEnabled();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get payment status" })
  async getStatus(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.paymentsService.getPaymentStatus(id, userId);
  }

  @Post(":id/confirm")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Confirm payment after client presented the sheet (server validates against provider)",
  })
  async confirm(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.paymentsService.confirmPayment(id, userId);
  }

  @Get("my/history")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get payment history" })
  async getHistory(@CurrentUser("id") userId: string) {
    return this.paymentsService.findByUser(userId);
  }
}
