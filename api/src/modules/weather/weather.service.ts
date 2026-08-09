import { Injectable, HttpException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.openweathermap.org/data/2.5";
  private readonly city = "Santa Cruz de la Sierra,BO";

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>("OPENWEATHER_API_KEY") || "";
  }

  async getCurrent() {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/weather`, {
          params: {
            q: this.city,
            appid: this.apiKey,
            units: "metric",
            lang: "es",
          },
        }),
      );

      return {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: data.wind.speed,
        city: data.name,
      };
    } catch (error) {
      throw new HttpException("Error fetching weather data", 502);
    }
  }

  async getForecast() {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/forecast`, {
          params: {
            q: this.city,
            appid: this.apiKey,
            units: "metric",
            lang: "es",
            cnt: 40,
          },
        }),
      );

      const daily = data.list
        .filter((_: any, i: number) => i % 8 === 0)
        .map((item: any) => ({
          date: item.dt_txt.split(" ")[0],
          temperature: Math.round(item.main.temp),
          tempMin: Math.round(item.main.temp_min),
          tempMax: Math.round(item.main.temp_max),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
        }));

      return { city: data.city.name, forecast: daily };
    } catch (error) {
      throw new HttpException("Error fetching forecast data", 502);
    }
  }
}
