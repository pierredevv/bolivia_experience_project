import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class PlatformConfigService {
  constructor(private prisma: PrismaService) {}

  async get(key: string, defaultValue: string): Promise<string> {
    const row = await this.prisma.platformConfig.findUnique({ where: { key } });
    return row?.value ?? defaultValue;
  }

  async getFloat(key: string, defaultValue: number): Promise<number> {
    const value = await this.get(key, String(defaultValue));
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  }

  async getInt(key: string, defaultValue: number): Promise<number> {
    const value = await this.get(key, String(defaultValue));
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  }

  async set(key: string, value: string) {
    return this.prisma.platformConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
