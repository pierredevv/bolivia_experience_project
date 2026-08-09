import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CreatePaymentDto } from "./dto";

@ApiTags("payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a payment" })
  async create(
    @CurrentUser("id") userId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(userId, dto);
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
  @ApiOperation({ summary: "Confirm payment" })
  async confirm(
    @Param("id") id: string,
    @Body("transactionId") transactionId: string | undefined,
    @CurrentUser("id") userId: string,
  ) {
    return this.paymentsService.confirmPayment(id, userId, transactionId);
  }

  @Get("my/history")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get payment history" })
  async getHistory(@CurrentUser("id") userId: string) {
    return this.paymentsService.findByUser(userId);
  }
}
