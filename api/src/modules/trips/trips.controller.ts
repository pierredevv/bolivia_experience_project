import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { TripsService } from "./trips.service";

@Controller("trips")
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  createTrip(
    @CurrentUser() user: any,
    @Body()
    body: {
      name: string;
      description?: string;
      destination?: string;
      startDate: string;
      endDate: string;
      budgetType?: string;
      budgetMin?: number;
      budgetMax?: number;
      tourismType?: string;
      groupType?: string;
      isPublic?: boolean;
    },
  ) {
    return this.tripsService.createTrip(user.id, body);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.tripsService.findAllByUser(user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.tripsService.findOne(id, user.id);
  }

  @Post(":id/days")
  addDay(
    @Param("id") tripId: string,
    @CurrentUser() user: any,
    @Body() body: { dayNumber: number; date: string; description?: string },
  ) {
    return this.tripsService.addDay(tripId, user.id, body);
  }

  @Post(":dayId/items")
  addItem(
    @Param("dayId") dayId: string,
    @CurrentUser() user: any,
    @Body()
    body: {
      placeId?: string;
      title: string;
      description?: string;
      timeSlot?: string;
      orderIndex?: number;
    },
  ) {
    return this.tripsService.addItem(dayId, user.id, body);
  }

  @Delete(":tripId/items/:itemId")
  removeItem(@Param("itemId") itemId: string, @CurrentUser() user: any) {
    return this.tripsService.removeItem(itemId, user.id);
  }

  @Delete(":tripId/days/:dayId")
  removeDay(@Param("dayId") dayId: string, @CurrentUser() user: any) {
    return this.tripsService.removeDay(dayId, user.id);
  }

  @Delete(":id")
  deleteTrip(@Param("id") id: string, @CurrentUser() user: any) {
    return this.tripsService.deleteTrip(id, user.id);
  }
}
