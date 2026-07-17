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

export interface ReportDistrictMatrix {
  reports: { ReportID: number; ReportName: string | null; Rank: number | null }[];
  districts: { DistrictID: number; DistrictName: string | null }[];
  values: { DistrictID: number; ReportID: number; rel_Value: string }[];
}

export interface ReportDistrictChange {
  reportId: number;
  districtId: number;
  value: string;
}

export interface ReportDetail {
  ArchiveID: number;
  ReportID: number | null;
  ReportDate: string | null;
  UpdateDate: string | null;
  FileLocation: string | null;
  Status: string | null;
}
