import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ChatbotController } from "./chatbot.controller";
import { ChatbotService } from "./chatbot.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { RecommendationsModule } from "../recommendations/recommendations.module";

@Module({
  imports: [PrismaModule, HttpModule, RecommendationsModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
