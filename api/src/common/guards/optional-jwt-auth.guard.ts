import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";

// Guard que autentica solo si hay un Bearer token válido.
// Si no hay token (o es inválido), deja pasar sin usuario para endpoints públicos.
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      return true;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get("JWT_SECRET"),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (user && user.isActive) {
        request.user = user;
      }
    } catch {
      // Token inválido: se ignora (endpoint público)
    }

    return true;
  }

  private extractToken(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
