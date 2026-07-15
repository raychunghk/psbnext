import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
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
    @Body() createEventDto: {
      EventTitle: string;
      EventDate: string; // ISO date string
      FileLocation: string;
    }
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

  @Get('reports/:id')
  async getReport(@Param('id', ParseIntPipe) id: number) {
    return this.psbService.getReportById(id);
  }

  @Get('reports/:id/latest')
  async getLatestReportDetail(@Param('id', ParseIntPipe) id: number) {
    return this.psbService.getLatestReportDetail(id);
  }

  // =============================================
  // DISTRICT ENDPOINTS
  // =============================================
  
  @Get('districts')
  async getDistricts() {
    return this.psbService.getEnabledDistricts();
  }

  @Get('districts/:id')
  async getDistrict(@Param('id', ParseIntPipe) id: number) {
    return this.psbService.getDistrictById(id);
  }

  @Get('districts/:id/reports')
  async getDistrictReports(@Param('id', ParseIntPipe) id: number) {
    return this.psbService.getDistrictReports(id);
  }

  @Get('districts/:id/rel-values')
  async getRelValues(@Param('id', ParseIntPipe) id: number) {
    return this.psbService.getDistinctRelValues(id);
  }

  @Get('districts/:id/additional-reports')
  async getAdditionalReports(
    @Param('id', ParseIntPipe) id: number,
    @Query('area') area: string
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