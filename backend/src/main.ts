import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import process from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.enableCors({
    origin: [
      'http://localhost:3000',           // Next.js dev
      'https://psbiis',                  // Production IIS
      'https://psbiis/next',             // Production with basePath
      'http://localhost:3000/next',      // Dev with basePath
      /\.raygor\.cc$/,                   // Regex for subdomains
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.setGlobalPrefix('api')
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
