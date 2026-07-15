import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  async getEnabledReports() {
    // Routes query operations explicitly through your initialized driver adapter instance
    return this.prisma.client.report.findMany({
      where: {
        Status: 'enable',
      },
      orderBy: {
        Rank: 'asc',
      },
    });
  }

  getHello(): string {
    return 'Hello World!';
  }
}
