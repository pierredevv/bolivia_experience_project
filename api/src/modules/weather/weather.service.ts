import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable()
export class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';
  private readonly city = 'Santa Cruz de la Sierra,BO';
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  private currentCache: CacheEntry<any> | null = null;
  private forecastCache: CacheEntry<any> | null = null;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('OPENWEATHER_API_KEY') || '';
  }

  private isCacheValid<T>(cache: CacheEntry<T> | null): boolean {
    if (!cache) return false;
    return Date.now() - cache.timestamp < this.CACHE_TTL;
  }

  async getCurrent() {
    if (this.isCacheValid(this.currentCache)) {
      return this.currentCache!.data;
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/weather`, {
          params: {
            q: this.city,
            appid: this.apiKey,
            units: 'metric',
            lang: 'es',
          },
        }),
      );

      const result = {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: data.wind.speed,
        city: data.name,
      };

      this.currentCache = { data: result, timestamp: Date.now() };

      return result;
    } catch (error) {
      throw new HttpException('Error fetching weather data', 502);
    }
  }

  async getForecast() {
    if (this.isCacheValid(this.forecastCache)) {
      return this.forecastCache!.data;
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/forecast`, {
          params: {
            q: this.city,
            appid: this.apiKey,
            units: 'metric',
            lang: 'es',
            cnt: 40,
          },
        }),
      );

      const daily = data.list
        .filter((_: any, i: number) => i % 8 === 0)
        .map((item: any) => ({
          date: item.dt_txt.split(' ')[0],
          temperature: Math.round(item.main.temp),
          tempMin: Math.round(item.main.temp_min),
          tempMax: Math.round(item.main.temp_max),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
        }));

      const result = { city: data.city.name, forecast: daily };

      this.forecastCache = { data: result, timestamp: Date.now() };

      return result;
    } catch (error) {
      throw new HttpException('Error fetching forecast data', 502);
    }
  }
}
