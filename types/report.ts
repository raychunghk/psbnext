export interface Report {
  ReportID: number;
  ReportName: string | null;
  Status: string | null;
  Rank: number | null;
}

export interface UploadReportDto {
  reportId: number;
  reportDate: string;
  file: File;
}
