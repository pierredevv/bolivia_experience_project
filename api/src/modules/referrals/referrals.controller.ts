import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ReferralsService } from "./referrals.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("referrals")
@Controller("referrals")
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get("code")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get or create referral code" })
  async getCode(@CurrentUser("id") userId: string) {
    return this.referralsService.getReferralCode(userId);
  }

  @Post("apply")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Apply a referral code" })
  async applyCode(
    @CurrentUser("id") userId: string,
    @Body("code") code: string,
  ) {
    return this.referralsService.applyReferralCode(userId, code);
  }

  @Get("stats")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get referral statistics" })
  async getStats(@CurrentUser("id") userId: string) {
    return this.referralsService.getReferralStats(userId);
  }
}
