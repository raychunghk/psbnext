import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { PsbModule } from './psb/psb.module';
@Module({
  imports: [PsbModule],
  controllers: [AppController],
  providers: [AppService,PrismaService],
})
export class AppModule {}
