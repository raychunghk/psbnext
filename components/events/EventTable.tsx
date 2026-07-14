'use client';

import { Table, Text, Box } from '@mantine/core';
import { Event } from '@/types/event';

interface EventTableProps {
  events: Event[];
  loading?: boolean;
}

export const EventTable: React.FC<EventTableProps> = ({ events, loading }) => {
  const formatDate = (date: Date | null): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return <Text ta="center" py="xl">Loading events...</Text>;
  }

  return (
    <Box style={{ marginTop: '20px' }}>
      <Table striped highlightOnHover withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date of Event</Table.Th>
            <Table.Th>Title</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {events.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={2} style={{ textAlign: 'center', padding: '20px' }}>
                <Text c="dimmed">No events found</Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            events.map((event, index) => (
              <Table.Tr
                key={event.EventID}
                style={{
                  backgroundColor: index % 2 === 0 ? '#D2ECFF' : '#F5FDFE',
                }}
              >
                <Table.Td style={{ whiteSpace: 'nowrap' }}>
                  {formatDate(event.EventDate)}
                </Table.Td>
                <Table.Td>
                  {event.FileLocation ? (
                    <a
                      href={event.FileLocation}
                      style={{
                        color: '#0066cc',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {event.EventTitle || 'Untitled'}
                    </a>
                  ) : (
                    <Text>{event.EventTitle || 'Untitled'}</Text>
                  )}
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </Box>
  );
};