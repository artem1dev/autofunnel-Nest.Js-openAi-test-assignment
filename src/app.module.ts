import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { OpenaiModule } from "./openai/openai.module";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";

@Module({
    imports: [
        ConfigModule.forRoot(),
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 5,
            },
        ]),
        OpenaiModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
