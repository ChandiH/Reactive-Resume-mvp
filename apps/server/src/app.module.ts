import path from "node:path";

import { HttpException, Module } from "@nestjs/common";
import { APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ServeStaticModule } from "@nestjs/serve-static";
import { RavenInterceptor, RavenModule } from "nest-raven";
import { ZodValidationPipe } from "nestjs-zod";

import { ConfigModule } from "./config/config.module";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./health/health.module";
import { PrinterModule } from "./printer/printer.module";
import { ResumeModule } from "./resume/resume.module";
import { StorageModule } from "./storage/storage.module";

@Module({
  imports: [
    // Core Modules
    ConfigModule,
    DatabaseModule,
    RavenModule,
    HealthModule,

    // Feature Modules
    ResumeModule,
    StorageModule,
    PrinterModule,

    // Static Assets
    ServeStaticModule.forRoot({
      serveRoot: "/artboard",
      // eslint-disable-next-line unicorn/prefer-module
      rootPath: path.join(__dirname, "..", "artboard"),
    }),
    ServeStaticModule.forRoot({
      renderPath: "/*",
      // eslint-disable-next-line unicorn/prefer-module
      rootPath: path.join(__dirname, "..", "client"),
    }),
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor({
        filters: [
          // Filter all HttpException with status code <= 500
          {
            type: HttpException,
            filter: (exception: HttpException) => exception.getStatus() < 500,
          },
        ],
      }),
    },
  ],
})
export class AppModule {}
