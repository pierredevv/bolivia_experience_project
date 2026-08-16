import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { GamificationService } from "./gamification.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("gamification")
@Controller("gamification")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get("me")
  @ApiOperation({ summary: "Get current user points and badges" })
  @ApiResponse({ status: 200, description: "User gamification data" })
  async getMe(@CurrentUser("id") userId: string) {
    return this.gamificationService.getUserGamification(userId);
  }

  @Get("badges")
  @ApiOperation({ summary: "List all available badges" })
  @ApiResponse({ status: 200, description: "All badges" })
  async getBadges() {
    return this.gamificationService.findAllBadges();
  }
}
