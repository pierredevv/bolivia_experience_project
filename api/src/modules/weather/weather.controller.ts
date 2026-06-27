import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WeatherService } from './weather.service';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current weather in Santa Cruz' })
  @ApiResponse({ status: 200, description: 'Current weather data' })
  async getCurrent() {
    return this.weatherService.getCurrent();
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Get 5-day weather forecast' })
  @ApiResponse({ status: 200, description: 'Weather forecast' })
  async getForecast() {
    return this.weatherService.getForecast();
  }
}
