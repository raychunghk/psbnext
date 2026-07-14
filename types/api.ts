export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface EventsResponse {
  events: Event[];
  total: number;
}