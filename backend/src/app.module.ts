import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { PsbModule } from './psb/psb.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Reads .env in the working directory of the server
    }),PsbModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
