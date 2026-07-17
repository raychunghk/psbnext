import axios from 'axios';
import { create } from 'zustand';
import { CreateEventDto, Event } from '@/types/event';

const API_BASE = '/next/api';

/**
 * Shared event data + async actions. Kept in a store (instead of page-local
 * state passed down as props) so the events page and any child components read
 * from a single source of truth.
 */
interface EventState {
  events: Event[];
  loading: boolean;
  loadEvents: () => Promise<void>;
  addEvent: (dto: CreateEventDto) => Promise<void>;
  deleteEvent: (eventId: number) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  loading: false,
  loadEvents: async () => {
    set({ loading: true });
    try {
      const response = await axios.get<Event[]>(`${API_BASE}/psb/events`);
      set({ events: response.data ?? [] });
    } finally {
      set({ loading: false });
    }
  },
  addEvent: async (dto) => {
    await axios.post(`${API_BASE}/psb/events`, dto);
    await get().loadEvents();
  },
  deleteEvent: async (eventId) => {
    await axios.post(`${API_BASE}/psb/events/${eventId}/delete`);
    set((state) => ({
      events: state.events.filter((event) => event.EventID !== eventId),
    }));
  },
}));
