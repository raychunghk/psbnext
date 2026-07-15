import { Module } from '@nestjs/common';
import { PsbController } from './psb.controller';
import { PsbService } from './psb.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PsbController],
  providers: [PsbService, PrismaService],
  exports: [PsbService],
})
export class PsbModule {}