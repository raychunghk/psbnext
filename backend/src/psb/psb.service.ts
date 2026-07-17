import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma.service';

// Extensions that must never be written to the (web-accessible) upload share:
// server-executable types (mirrors the legacy ASP DeniedFilesList) plus
// browser-executable types that could enable stored XSS if served directly.
const DENIED_EXTENSIONS = [
  'asp',
  'aspx',
  'jsp',
  'php',
  'php3',
  'php4',
  'php5',
  'phtml',
  'java',
  'class',
  'jar',
  'js',
  'mjs',
  'cjs',
  'vbs',
  'html',
  'htm',
  'xhtml',
  'shtml',
  'svg',
  'xml',
  'exe',
  'bat',
  'cmd',
  'com',
  'sh',
  'cgi',
  'pl',
];

@Injectable()
export class PsbService {
  constructor(private prisma: PrismaService) {}

  // =============================================
  // EVENT SERVICES
  // =============================================

  async getEnabledEvents() {
    return this.prisma.client.event.findMany({
      where: {
        Status: 'enable',
      },
      orderBy: {
        EventDate: 'desc',
      },
    });
  }

  async createEvent(data: {
    EventTitle: string;
    EventDate: Date;
    FileLocation: string;
  }) {
    return this.prisma.client.event.create({
      data: {
        EventTitle: data.EventTitle,
        EventDate: data.EventDate,
        UpdateDate: new Date(),
        FileLocation: data.FileLocation,
        Status: 'enable',
        IsInArchive: 'no',
      },
    });
  }

  async deleteEvent(eventId: number) {
    return this.prisma.client.event.update({
      where: { EventID: eventId },
      data: { Status: 'disable' },
    });
  }

  async deleteMultipleEvents(eventIds: number[]) {
    return this.prisma.client.event.updateMany({
      where: {
        EventID: {
          in: eventIds,
        },
      },
      data: { Status: 'disable' },
    });
  }

  // =============================================
  // REPORT SERVICES
  // =============================================

  async getEnabledReports() {
    return this.prisma.client.report.findMany({
      where: {
        Status: 'enable',
      },
      orderBy: {
        Rank: 'asc',
      },
    });
  }

  async getReportById(reportId: number) {
    return this.prisma.client.report.findUnique({
      where: { ReportID: reportId },
    });
  }

  async createReport(name: string, rank: number) {
    const reportName = name.trim();
    if (!reportName) {
      throw new BadRequestException('Please input the Report Name.');
    }

    const existing = await this.prisma.client.report.findFirst({
      where: { ReportName: reportName, Status: 'enable' },
    });
    if (existing) {
      throw new BadRequestException('This Report already exists.');
    }

    const report = await this.prisma.client.report.create({
      data: { ReportName: reportName, Rank: rank, Status: 'enable' },
    });

    // Mirror the legacy ASP behaviour: pair the new report with every enabled
    // district in the District_Report table (rel_Value 'null' by default).
    const districts = await this.prisma.client.district.findMany({
      where: { Status: 'enable' },
      select: { DistrictID: true },
    });
    for (const district of districts) {
      await this.prisma.client.$executeRaw`
        INSERT INTO District_Report(DistrictID, ReportID, rel_Value)
        VALUES (${district.DistrictID}, ${report.ReportID}, 'null')
      `;
    }

    return report;
  }

  async updateReportRank(reportId: number, rank: number) {
    return this.prisma.client.report.update({
      where: { ReportID: reportId },
      data: { Rank: rank },
    });
  }

  async deleteReport(reportId: number) {
    return this.prisma.client.report.update({
      where: { ReportID: reportId },
      data: { Status: 'disable' },
    });
  }

  async uploadReport(data: {
    reportId: number;
    reportDate: Date;
    file: Express.Multer.File;
  }) {
    const { reportId, reportDate, file } = data;

    const extension = path
      .extname(file.originalname)
      .replace('.', '')
      .toLowerCase();
    if (DENIED_EXTENSIONS.includes(extension)) {
      throw new BadRequestException(
        `Files of type ".${extension}" are not allowed.`,
      );
    }

    // Physical directory where files are written (mirrors the old ASP upload
    // folder). Configurable so each environment can point at its own storage.
    const uploadDir =
      process.env.REPORT_UPLOAD_DIR ||
      path.join(process.cwd(), 'uploads', 'financial', 'file');
    fs.mkdirSync(uploadDir, { recursive: true });

    // Prefix a unique token so re-uploading a file with the same name (e.g.
    // "monthly.xlsx" each month) does not overwrite previously stored versions.
    const originalName = path.basename(file.originalname);
    const fileName = `${Date.now()}-${randomUUID()}-${originalName}`;
    fs.writeFileSync(path.join(uploadDir, fileName), file.buffer);

    // Web-accessible location stored in the DB (mirrors the old FileLocation).
    const publicBase =
      process.env.REPORT_PUBLIC_PATH || '/PSB/project/financial/Upload/file';
    const fileLocation = `${publicBase}/${fileName}`;

    const detail = await this.prisma.client.reportDetail.create({
      data: {
        ReportID: reportId,
        ReportDate: reportDate,
        UpdateDate: new Date(),
        FileLocation: fileLocation,
        Status: 'enable',
      },
    });

    return { success: true, fileLocation, detail };
  }

  // =============================================
  // DISTRICT SERVICES
  // =============================================

  async getEnabledDistricts() {
    return this.prisma.client.district.findMany({
      where: {
        Status: 'enable',
      },
      orderBy: {
        DistrictName: 'asc',
      },
    });
  }

  async getDistrictById(districtId: number) {
    return this.prisma.client.district.findUnique({
      where: { DistrictID: districtId },
    });
  }

  async createDistrict(name: string) {
    const districtName = name.trim();
    if (!districtName) {
      throw new BadRequestException('Please input the District Name.');
    }

    const existing = await this.prisma.client.district.findFirst({
      where: { DistrictName: districtName, Status: 'enable' },
    });
    if (existing) {
      throw new BadRequestException('This District already exists.');
    }

    const district = await this.prisma.client.district.create({
      data: { DistrictName: districtName, Status: 'enable' },
    });

    // Mirror the legacy ASP behaviour: pair the new district with every enabled
    // report in the District_Report table (rel_Value 'null' by default).
    const reports = await this.prisma.client.report.findMany({
      where: { Status: 'enable' },
      select: { ReportID: true },
    });
    for (const report of reports) {
      await this.prisma.client.$executeRaw`
        INSERT INTO District_Report(DistrictID, ReportID, rel_Value)
        VALUES (${district.DistrictID}, ${report.ReportID}, 'null')
      `;
    }

    return district;
  }

  async deleteDistrict(districtId: number) {
    return this.prisma.client.district.update({
      where: { DistrictID: districtId },
      data: { Status: 'disable' },
    });
  }

  async getDistrictReports(districtId: number) {
    // Note: District_Report is marked as @ignore in Prisma
    // You'll need to use raw SQL for this
    return this.prisma.client.$queryRaw`
      SELECT district_report.reportID, report.reportName 
      FROM District_Report 
      INNER JOIN report ON District_report.reportID = report.reportID 
      WHERE report.status = 'enable' 
      AND District_Report.rel_Value = 'all' 
      AND DistrictID = ${districtId}
      ORDER BY report.rank
    `;
  }

  // =============================================
  // REPORT-DISTRICT MATRIX SERVICES
  // =============================================

  async getReportDistrictMatrix() {
    const reports = await this.prisma.client.report.findMany({
      where: { Status: 'enable' },
      orderBy: { Rank: 'asc' },
      select: { ReportID: true, ReportName: true, Rank: true },
    });
    const districts = await this.prisma.client.district.findMany({
      where: { Status: 'enable' },
      orderBy: { DistrictName: 'asc' },
      select: { DistrictID: true, DistrictName: true },
    });

    // District_Report is @ignore in Prisma, so read the mapping via raw SQL.
    const values = await this.prisma.client.$queryRaw<
      { DistrictID: number; ReportID: number; rel_Value: string }[]
    >`
      SELECT DistrictID, ReportID, rel_Value
      FROM District_Report
    `;

    return { reports, districts, values };
  }

  async batchUpdateReportDistrict(
    changes: { reportId: number; districtId: number; value: string }[],
  ) {
    if (!Array.isArray(changes) || changes.length === 0) {
      return { updated: 0 };
    }

    for (const change of changes) {
      if (
        !Number.isInteger(change.reportId) ||
        !Number.isInteger(change.districtId)
      ) {
        throw new BadRequestException(
          'Each change requires a valid reportId and districtId.',
        );
      }
    }

    // Apply every change in a single transaction so the matrix update is
    // atomic (replaces the legacy per-cell ADO UPDATE loop / N+1 queries).
    // An empty value maps back to the sentinel 'null' string, mirroring the
    // legacy ASP behaviour.
    const results = await this.prisma.client.$transaction(
      changes.map((change) => {
        const relValue =
          typeof change.value === 'string' && change.value.trim() !== ''
            ? change.value.trim()
            : 'null';
        return this.prisma.client.$executeRaw`
          UPDATE District_Report
          SET rel_Value = ${relValue}
          WHERE DistrictID = ${change.districtId}
          AND ReportID = ${change.reportId}
        `;
      }),
    );

    const updated = results.reduce((sum, count) => sum + count, 0);
    return { updated };
  }

  // =============================================
  // REPORT DETAIL SERVICES
  // =============================================

  async getLatestReportDetail(reportId: number) {
    return this.prisma.client.reportDetail.findFirst({
      where: {
        ReportID: reportId,
        Status: 'enable',
      },
      orderBy: {
        ReportDate: 'desc',
      },
    });
  }

  async getReportDetails(reportId: number) {
    return this.prisma.client.reportDetail.findMany({
      where: {
        ReportID: reportId,
        Status: 'enable',
      },
      orderBy: {
        ReportDate: 'desc',
      },
    });
  }

  async deleteReportDetail(archiveId: number) {
    return this.prisma.client.reportDetail.update({
      where: { ArchiveID: archiveId },
      data: { Status: 'disable' },
    });
  }

  async getReportDetailByDate(reportId: number, reportDate: Date) {
    return this.prisma.client.reportDetail.findFirst({
      where: {
        ReportID: reportId,
        ReportDate: reportDate,
        Status: 'enable',
      },
      orderBy: {
        UpdateDate: 'desc',
      },
    });
  }

  // =============================================
  // RELATION VALUE SERVICES (for Additional Reports)
  // =============================================

  async getDistinctRelValues(districtId: number) {
    // Raw SQL since District_Report is ignored
    const results = await this.prisma.client.$queryRaw<{ rel_Value: string }[]>`
      SELECT rel_Value 
      FROM District_Report 
      WHERE rel_Value <> 'null' 
      AND districtID = ${districtId} 
      GROUP BY rel_Value 
      ORDER BY rel_Value
    `;
    return results.map((r) => r.rel_Value);
  }

  async getAdditionalReports(districtId: number, area: string) {
    // Raw SQL for LIKE query
    return this.prisma.client.$queryRaw`
      SELECT district_report.reportID, report.reportName 
      FROM District_Report 
      INNER JOIN report ON District_report.reportID = report.reportID 
      WHERE report.status = 'enable' 
      AND District_Report.rel_Value LIKE ${'%' + area + '%'} 
      AND DistrictID = ${districtId} 
      ORDER BY report.rank
    `;
  }

  // =============================================
  // SORTING UTILITY (for arraySort function)
  // =============================================

  async sortItems(items: string[]) {
    // If you want to use the sorting table
    // First, clear existing data
    await this.prisma.client.$executeRaw`DELETE FROM sorting`;

    // Insert items
    for (const item of items) {
      if (item && item.toLowerCase() !== 'all') {
        await this.prisma.client.$executeRaw`
          INSERT INTO sorting (sortItem) VALUES (${item})
        `;
      }
    }

    // Get sorted results
    const results = await this.prisma.client.$queryRaw<{ sortItem: string }[]>`
      SELECT sortItem 
      FROM sorting 
      WHERE sortItem IS NOT NULL 
      GROUP BY sortItem 
      ORDER BY sortItem
    `;

    // Clean up
    await this.prisma.client.$executeRaw`DELETE FROM sorting`;

    return results.map((r) => r.sortItem);
  }

  // =============================================
  // GENERIC UTILITY
  // =============================================

  async executeRawQuery(query: string, params?: any[]) {
    if (params) {
      return this.prisma.client.$queryRawUnsafe(query, ...params);
    }
    return this.prisma.client.$queryRawUnsafe(query);
  }

  getHello(): string {
    return 'Hello from PSB API!';
  }
}
