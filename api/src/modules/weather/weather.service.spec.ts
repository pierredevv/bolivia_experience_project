import { Test, TestingModule } from "@nestjs/testing";
import { WeatherService } from "./weather.service";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { HttpException } from "@nestjs/common";
import { of } from "rxjs";

describe("WeatherService", () => {
  let service: WeatherService;
  let httpService: HttpService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue("test-api-key"),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = module.get<HttpService>(HttpService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getCurrent", () => {
    it("should return current weather data", async () => {
      const mockResponse = {
        data: {
          main: { temp: 28, feels_like: 30, humidity: 65 },
          weather: [{ description: "parcialmente nublado", icon: "02d" }],
          wind: { speed: 12 },
          name: "Santa Cruz de la Sierra",
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getCurrent();
      expect(result).toEqual({
        temperature: 28,
        feelsLike: 30,
        humidity: 65,
        description: "parcialmente nublado",
        icon: "02d",
        windSpeed: 12,
        city: "Santa Cruz de la Sierra",
      });
    });

    it("should throw HttpException on API error", async () => {
      mockHttpService.get.mockReturnValue({
        toPromise: () => Promise.reject(new Error("API Error")),
      });

      await expect(service.getCurrent()).rejects.toThrow(HttpException);
    });
  });

  describe("getForecast", () => {
    it("should return forecast data", async () => {
      const mockResponse = {
        data: {
          city: { name: "Santa Cruz de la Sierra" },
          list: Array.from({ length: 40 }, (_, i) => ({
            dt_txt: `2026-07-${Math.floor(i / 8) + 2} ${String((i % 8) * 3).padStart(2, "0")}:00:00`,
            main: { temp: 25 + (i % 5), temp_min: 22, temp_max: 30 },
            weather: [{ description: "soleado", icon: "01d" }],
            humidity: 60,
          })),
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getForecast();
      expect(result).toHaveProperty("city");
      expect(result).toHaveProperty("forecast");
      expect(result.forecast.length).toBe(5);
    });
  });

  describe("getCities", () => {
    it("should return the list of supported cities", () => {
      const cities = service.getCities();
      expect(Array.isArray(cities)).toBe(true);
      expect(cities.length).toBeGreaterThanOrEqual(9);
      const santaCruz = cities.find((c) => c.id === "santa-cruz");
      expect(santaCruz).toBeDefined();
      expect(santaCruz!.query).toBe("Santa Cruz de la Sierra,BO");
    });
  });

  describe("city selector", () => {
    it("getCurrent should pass the selected city query", async () => {
      const mockResponse = {
        data: {
          main: { temp: 18, feels_like: 19, humidity: 55 },
          weather: [{ description: "despejado", icon: "01d" }],
          wind: { speed: 8 },
          name: "La Paz",
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getCurrent("la-paz");
      expect(result.city).toBe("La Paz");
      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining("/weather"),
        expect.objectContaining({
          params: expect.objectContaining({ q: "La Paz,BO" }),
        }),
      );
    });

    it("getCurrent should use Santa Cruz by default", async () => {
      const mockResponse = {
        data: {
          main: { temp: 28, feels_like: 30, humidity: 65 },
          weather: [{ description: "soleado", icon: "01d" }],
          wind: { speed: 12 },
          name: "Santa Cruz de la Sierra",
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getCurrent(undefined);
      expect(result.city).toBe("Santa Cruz de la Sierra");
      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining("/weather"),
        expect.objectContaining({
          params: expect.objectContaining({ q: "Santa Cruz de la Sierra,BO" }),
        }),
      );
    });

    it("getForecast should pass the selected city query", async () => {
      const mockResponse = {
        data: {
          city: { name: "Cochabamba" },
          list: Array.from({ length: 40 }, (_, i) => ({
            dt_txt: `2026-07-${Math.floor(i / 8) + 2} ${String((i % 8) * 3).padStart(2, "0")}:00:00`,
            main: { temp: 25, temp_min: 22, temp_max: 30 },
            weather: [{ description: "soleado", icon: "01d" }],
            humidity: 60,
          })),
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getForecast("cochabamba");
      expect(result.city).toBe("Cochabamba");
      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining("/forecast"),
        expect.objectContaining({
          params: expect.objectContaining({ q: "Cochabamba,BO" }),
        }),
      );
    });
  });

  describe("without API key", () => {
    it("getCurrent should throw 503 when no API key is configured", async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WeatherService,
          { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue("") } },
          { provide: HttpService, useValue: mockHttpService },
        ],
      }).compile();

      const noKeyService = module.get<WeatherService>(WeatherService);

      await expect(noKeyService.getCurrent()).rejects.toThrow(
        new HttpException("Weather service unavailable: API key not configured", 503),
      );
    });

    it("getForecast should throw 503 when no API key is configured", async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WeatherService,
          { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue("") } },
          { provide: HttpService, useValue: mockHttpService },
        ],
      }).compile();

      const noKeyService = module.get<WeatherService>(WeatherService);

      await expect(noKeyService.getForecast()).rejects.toThrow(
        new HttpException("Weather service unavailable: API key not configured", 503),
      );
    });
  });
});
