import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use Pino Logger
  app.useLogger(app.get(Logger));

  // Enable CORS with support for multiple origins and trailing slash normalization
  const allowedOrigins = [
    'http://localhost:3000',
    'https://telegram-message-search.vercel.app',
  ];

  if (process.env.FRONTEND_URL) {
    const rawUrl = process.env.FRONTEND_URL.trim();
    const cleanUrl = rawUrl.replace(/\/$/, '');
    if (!allowedOrigins.includes(rawUrl)) allowedOrigins.push(rawUrl);
    if (!allowedOrigins.includes(cleanUrl)) allowedOrigins.push(cleanUrl);
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.trim().replace(/\/$/, '');
      const isAllowed =
        allowedOrigins.some((allowed) => allowed.replace(/\/$/, '') === normalizedOrigin) ||
        normalizedOrigin.endsWith('.vercel.app');

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  });

  // Global Prefix & Validation
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // Setup Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Telegram Message Search API')
    .setDescription(
      'Production-Grade AI-Powered Telegram Message Search Backend Service API Documentation',
    )
    .setVersion('1.0')
    .addTag('Health Check')
    .addTag('Telegram Messages')
    .addTag('AI Search')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 NestJS Backend running on: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger Documentation at: http://localhost:${port}/api/docs`);
}
bootstrap();
