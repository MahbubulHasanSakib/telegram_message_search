import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { validateEnv } from './config/env.schema';
import { HealthController } from './health/health.controller';
import { DatabaseModule } from './modules/database/database.module';
import { MessagesModule } from './modules/messages/messages.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),
    DatabaseModule,
    MessagesModule,
    SearchModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
