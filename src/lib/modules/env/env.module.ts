import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ENV } from "./env.service.js";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "./.env",
    }),
  ],
  providers: [ENV],
  exports: [ENV],
})
export class ENVModule {}
