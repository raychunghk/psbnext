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

export interface District {
  DistrictID: number;
  DistrictName: string | null;
  Status: string | null;
}

export interface ReportDetail {
  ArchiveID: number;
  ReportID: number | null;
  ReportDate: string | null;
  UpdateDate: string | null;
  FileLocation: string | null;
  Status: string | null;
}
