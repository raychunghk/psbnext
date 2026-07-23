import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import process from 'process';
import { Logger } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.enableCors({
    origin: [
      'http://localhost:3000',           // Next.js dev
      'https://psbiis',                  // Production IIS
      'https://psbiis/next', // Production with basePath
      'http://localhost:3000/next',      // Dev with basePath
      /\.raygor\.cc$/,                   // Regex for subdomains
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const appEnv = configService.get<string>('APP_ENV') || process.env.APP_ENV || 'UNKNOWN_ENV';
  const dbHost = configService.get<string>('HOST') || process.env.HOST || 'UNKNOWN_HOST';
  const port = configService.get<number>('PORT') || process.env.PORT || 5000;
  await app.listen(process.env.PORT ?? 5000);
  // Print startup environment banner
  logger.log('====================================================');
  logger.log(`🚀 Application Started Successfully!`);
  logger.log(`🏷️  ENVIRONMENT IDENTIFIER : [ ${appEnv} ]`);
  logger.log(`🗄️  DATABASE TARGET HOST   : [ ${dbHost} ]`);
  logger.log(`🌐 LISTENING PORT          : [ ${port} ]`);
  logger.log('====================================================');
}
bootstrap();
