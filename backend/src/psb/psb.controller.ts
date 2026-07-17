import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { PsbService } from './psb.service';

@Controller('psb')
export class PsbController {
  constructor(private readonly psbService: PsbService) {}

  // =============================================
  // HEALTH CHECK
  // =============================================

  @Get()
  getHello(): string {
    return this.psbService.getHello();
  }

  // =============================================
  // EVENT ENDPOINTS
  // =============================================

  @Get('events')
  async getEvents() {
    return this.psbService.getEnabledEvents();
  }

  @Post('events')
  async createEvent(
    @Body()
    createEventDto: {
      EventTitle: string;
      EventDate: string; // ISO date string
      FileLocation: string;
    },
  ) {
    const eventDate = new Date(createEventDto.EventDate);
    return this.psbService.createEvent({
      EventTitle: createEventDto.EventTitle,
      EventDate: eventDate,
      FileLocation: createEventDto.FileLocation,
    });
  }

  @Post('events/delete')
  async deleteEvents(@Body() body: { eventIds: number[] }) {
    if (body.eventIds.length === 1) {
      return this.psbService.deleteEvent(body.eventIds[0]);
    }
    return this.psbService.deleteMultipleEvents(body.eventIds);
  }

  @Post('events/:id/delete')
  async deleteEvent(@Param('id', ParseIntPipe) id: number) {
    return this.psbService.deleteEvent(id);
  }

  // =============================================
  // REPORT ENDPOINTS
  // =============================================

  @Get('reports')
  async getReports() {
    return this.psbService.getEnabledReports();
  }

  @Post('reports')
  async createReport(@Body() body: { name: string; rank?: number }) {
    const rank = Number(body.rank);
    return this.psbService.createReport(
      body.name ?? '',
      Number.isInteger(rank) ? rank : 0,
    );
  }

  @Get('reports/:id')
  async getReport(@Param('id', ParseIntPipe) id: number) {
    return this.psbService.getReportById(id);
  }

  @Post('reports/:id/rank')
  async updateReportRank(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { rank: number },
  ) {
    const rank = Number(body.rank);
    if (!Number.isInteger(rank)) {
      throw new BadRequestException('A valid rank is required.');
    }
    return this.psbService.updateReportRank(id, rank);
  }

  @Post('reports/:id/delete')
  async deleteReport(@Param('id', ParseIntPipe) id: number) {
    return this.psbService.deleteReport(id);
  }

  @Get('reports/:id/latest')
  async getLatestReportDetail(@Param('id', ParseIntPipe) id: number) {
    return this.psbService.getLatestReportDetail(id);
  }

  @Get('reports/:id/details')
  async getReportDetails(@Param('id', ParseIntPipe) id: number) {
    return this.psbService.getReportDetails(id);
  }

  @Post('reports/upload')
  @UseInterceptors(
    FileInterceptor('uploadFile', {
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async uploadReport(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { report: string; reportDate: string },
  ) {
    if (!file) {
      throw new BadRequestException('Please select the upload file.');
    }
    const reportId = Number(body.report);
    if (!Number.isInteger(reportId)) {
      throw new BadRequestException('A valid report must be selected.');
    }
    const reportDate = new Date(body.reportDate);
    if (Number.isNaN(reportDate.getTime())) {
      throw new BadRequestException('A valid report date is required.');
    }
    return this.psbService.uploadReport({ reportId, reportDate, file });
  }

  @Get('reportdetails/:id/download')
  async downloadReportDetail(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    const { filePath, downloadName } =
      await this.psbService.getReportDetailFile(id);
    // RFC 6266: quoted ASCII fallback for legacy clients plus a percent-encoded
    // filename* for full-fidelity Unicode names. Only filename* is encoded.
    const asciiName = downloadName
      .replace(/[^\x20-\x7e]/g, '_')
      .replace(/["\\]/g, '_');
    return new StreamableFile(createReadStream(filePath), {
      type: 'application/octet-stream',
      disposition:
        `attachment; filename="${asciiName}"; ` +
        `filename*=UTF-8''${encodeURIComponent(downloadName)}`,
    });
  }

  @Post('reportdetails/:id/delete')
  async deleteReportDetail(@Param('id', ParseIntPipe) id: number) {
    return this.psbService.deleteReportDetail(id);
  }

  // =============================================
  // DISTRICT ENDPOINTS
  // =============================================

  @Get('districts')
  async getDistricts() {
    return this.psbService.getEnabledDistricts();
  }

  @Post('districts')
  async createDistrict(@Body() body: { name: string }) {
    return this.psbService.createDistrict(body.name ?? '');
  }

  @Get('districts/:id')
  async getDistrict(@Param('id', ParseIntPipe) id: number) {
    return this.psbService.getDistrictById(id);
  }

  @Post('districts/:id/delete')
  async deleteDistrict(@Param('id', ParseIntPipe) id: number) {
    return this.psbService.deleteDistrict(id);
  }

  @Get('districts/:id/reports')
  async getDistrictReports(@Param('id', ParseIntPipe) id: number) {
    return this.psbService.getDistrictReports(id);
  }

  // =============================================
  // REPORT-DISTRICT MATRIX ENDPOINTS
  // =============================================

  @Get('report-district/matrix')
  async getReportDistrictMatrix() {
    return this.psbService.getReportDistrictMatrix();
  }

  @Post('report-district/batch-update')
  async batchUpdateReportDistrict(
    @Body()
    body: {
      changes: { reportId: number; districtId: number; value: string }[];
    },
  ) {
    return this.psbService.batchUpdateReportDistrict(body.changes ?? []);
  }

  @Get('districts/:id/rel-values')
  async getRelValues(@Param('id', ParseIntPipe) id: number) {
    return this.psbService.getDistinctRelValues(id);
  }

  @Get('districts/:id/additional-reports')
  async getAdditionalReports(
    @Param('id', ParseIntPipe) id: number,
    @Query('area') area: string,
  ) {
    return this.psbService.getAdditionalReports(id, area);
  }

  // =============================================
  // SORTING ENDPOINT
  // =============================================

  @Post('sort')
  async sortItems(@Body() body: { items: string[] }) {
    return this.psbService.sortItems(body.items);
  }
}
