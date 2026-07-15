import { Event, CreateEventDto, DeleteEventsDto } from '@/types/event';
import { getApiUrl } from './config';

const API_BASE = getApiUrl();

export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    console.log(`url?: ${url}`)
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async getEvents(): Promise<Event[]> {
    return this.request<Event[]>('/psb/events');
  }

  static async createEvent(data: CreateEventDto): Promise<Event> {
    return this.request<Event>('/psb/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async deleteEvent(eventId: number): Promise<void> {
    return this.request<void>(`/psb/events/${eventId}/delete`, {
      method: 'POST',
    });
  }

  static async deleteMultipleEvents(eventIds: number[]): Promise<void> {
    return this.request<void>('/psb/events/delete', {
      method: 'POST',
      body: JSON.stringify({ eventIds }),
    });
  }

  static async getReports(): Promise<any[]> {
    return this.request<any[]>('/psb/reports');
  }

  static async getDistricts(): Promise<any[]> {
    return this.request<any[]>('/psb/districts');
  }

  static async getDistrictReports(districtId: number): Promise<any[]> {
    return this.request<any[]>(`/psb/districts/${districtId}/reports`);
  }
}

// Export convenience functions
export const fetchEvents = ApiClient.getEvents;
export const createEvent = ApiClient.createEvent;
export const deleteEvent = ApiClient.deleteEvent;
export const deleteMultipleEvents = ApiClient.deleteMultipleEvents;