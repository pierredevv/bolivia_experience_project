import { Injectable, HttpException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

export interface WeatherCity {
  id: string;
  name: string;
  query: string;
  latitude: number;
  longitude: number;
}

@Injectable()
export class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.openweathermap.org/data/2.5";
  private readonly defaultCity = "Santa Cruz de la Sierra,BO";

  private readonly cities: WeatherCity[] = [
    { id: "santa-cruz", name: "Santa Cruz de la Sierra", query: "Santa Cruz de la Sierra,BO", latitude: -17.7833, longitude: -63.1821 },
    { id: "la-paz", name: "La Paz", query: "La Paz,BO", latitude: -16.5000, longitude: -68.1500 },
    { id: "cochabamba", name: "Cochabamba", query: "Cochabamba,BO", latitude: -17.3895, longitude: -66.1568 },
    { id: "sucre", name: "Sucre", query: "Sucre,BO", latitude: -19.0333, longitude: -65.2625 },
    { id: "potosi", name: "Potosí", query: "Potosí,BO", latitude: -19.5836, longitude: -65.7531 },
    { id: "oruro", name: "Oruro", query: "Oruro,BO", latitude: -17.9833, longitude: -67.1500 },
    { id: "tarija", name: "Tarija", query: "Tarija,BO", latitude: -21.5355, longitude: -64.7296 },
    { id: "trinidad", name: "Trinidad", query: "Trinidad,BO", latitude: -14.8333, longitude: -64.9000 },
    { id: "cobija", name: "Cobija", query: "Cobija,BO", latitude: -11.0267, longitude: -68.7692 },
    { id: "el-alto", name: "El Alto", query: "El Alto,BO", latitude: -16.5044, longitude: -68.1631 },
  ];

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>("OPENWEATHER_API_KEY") || "";
  }

  getCities(): WeatherCity[] {
    return this.cities;
  }

  private assertApiKeyConfigured() {
    if (!this.apiKey) {
      throw new HttpException("Weather service unavailable: API key not configured", 503);
    }
  }

  private resolveQuery(cityId?: string): string {
    const city = this.cities.find((c) => c.id === cityId);
    return city ? city.query : this.defaultCity;
  }

  async getCurrent(cityId?: string) {
    this.assertApiKeyConfigured();
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/weather`, {
          params: {
            q: this.resolveQuery(cityId),
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

  async getForecast(cityId?: string) {
    this.assertApiKeyConfigured();
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/forecast`, {
          params: {
            q: this.resolveQuery(cityId),
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
