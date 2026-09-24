import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { WeatherService } from "./weather.service";

@ApiTags("weather")
@Controller("weather")
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get("cities")
  @ApiOperation({ summary: "List supported cities for weather queries" })
  @ApiResponse({ status: 200, description: "Supported cities" })
  async getCities() {
    return this.weatherService.getCities();
  }

  @Get("current")
  @ApiOperation({ summary: "Get current weather in a supported city" })
  @ApiQuery({ name: "city", required: false, description: "City id from /weather/cities (default: Santa Cruz)" })
  @ApiResponse({ status: 200, description: "Current weather data" })
  async getCurrent(@Query("city") city?: string) {
    return this.weatherService.getCurrent(city);
  }

  @Get("forecast")
  @ApiOperation({ summary: "Get 5-day weather forecast for a supported city" })
  @ApiQuery({ name: "city", required: false, description: "City id from /weather/cities (default: Santa Cruz)" })
  @ApiResponse({ status: 200, description: "Weather forecast" })
  async getForecast(@Query("city") city?: string) {
    return this.weatherService.getForecast(city);
  }
}
