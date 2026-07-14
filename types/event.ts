export interface Event {
  EventID: number;
  EventTitle: string | null;
  EventDate: Date | null;
  UpdateDate: Date | null;
  IsInArchive: string | null;
  Status: string | null;
  FileLocation: string | null;
}

export interface CreateEventDto {
  EventTitle: string;
  EventDate: string;
  FileLocation: string;
}

export interface DeleteEventsDto {
  eventIds: number[];
}