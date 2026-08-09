import { Module, Global } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { OptionalJwtAuthGuard } from "./optional-jwt-auth.guard";
import { RolesGuard } from "./roles.guard";
import { AuthModule } from "../../modules/auth/auth.module";

@Global()
@Module({
  imports: [AuthModule],
  providers: [JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard],
})
export class GuardsModule {}
