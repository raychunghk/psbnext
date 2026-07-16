'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Container,
  Paper,
  LoadingOverlay,
  Box,
  Stack,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Event } from '@/types/event';
import { EventHeader } from '@/components/events/EventHeader';
import { EventTable } from '@/components/events/EventTable';
import { EventActions } from '@/components/events/EventActions';

// Crucial: Point directly to the base path + /api proxied route.
// Next.js rewrites will catch anything starting with /next/api and pass it to Nest.js.
const API_BASE = '/next/api';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async (): Promise<void> => {
    try {
      setLoading(true);
      const url = `${API_BASE}/psb/events`;
      console.log(`Fetching events from relative route: ${url}`);
      
      const response = await axios.get<Event[]>(url);
      console.log('Events response:', response.data);
      
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      notifications.show({
        title: 'Error',
        message: axios.isAxiosError(error) 
          ? error.response?.data?.message || error.message
          : 'Failed to load events',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (): void => {
    router.push('/events/add');
  };

  const handleDelete = (): void => {
    router.push('/events/delete');
  };

  return (
    <Container size="lg" py="xl">
      <Paper shadow="sm" p="md" radius="md">
        <Box style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          
          <Stack gap="md">
            <EventHeader />
            <EventTable events={events} loading={loading} />
            <EventActions onAdd={handleAdd} onDelete={handleDelete} />
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}