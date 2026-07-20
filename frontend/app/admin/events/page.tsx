'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Anchor,
  Button,
  Container,
  Text,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { IconCalendarPlus, IconTrash } from '@tabler/icons-react';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table-open';
import axios from 'axios';
import { Event } from '@/types/event';
import { useEventStore } from '@/lib/stores/eventStore';

const formatDate = (date: Event['EventDate']): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const toDateString = (value: unknown): string | null => {
  if (!value) return null;
  const asString = String(value);
  return asString ? asString.slice(0, 10) : null;
};

const errorMessage = (error: unknown, fallback: string): string =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || error.message
    : fallback;

export default function EventsPage() {
  const { events, loading, loadEvents, addEvent, deleteEvent } =
    useEventStore();
  const [createDate, setCreateDate] = useState<string | null>(null);

  useEffect(() => {
    loadEvents().catch((error) => {
      notifications.show({
        title: 'Error',
        message: errorMessage(error, 'Failed to load events'),
        color: 'red',
      });
    });
  }, [loadEvents]);

  const columns = useMemo<MRT_ColumnDef<Event>[]>(
    () => [
      {
        accessorKey: 'EventDate',
        header: 'Date of Event',
        size: 160,
        Cell: ({ cell }) => formatDate(cell.getValue<Event['EventDate']>()),
        Edit: () => (
          <DateInput
            label="Date of Event"
            value={createDate}
            valueFormat="DD/MM/YYYY"
            placeholder="Select date"
            required
            popoverProps={{ withinPortal: true }}
            onChange={setCreateDate}
          />
        ),
      },
      {
        accessorKey: 'EventTitle',
        header: 'Title',
        mantineEditTextInputProps: {
          required: true,
          placeholder: 'Event title',
        },
        Cell: ({ row }) =>
          row.original.FileLocation ? (
            <Anchor href={row.original.FileLocation} target="_blank">
              {row.original.EventTitle || 'Untitled'}
            </Anchor>
          ) : (
            <Text>{row.original.EventTitle || 'Untitled'}</Text>
          ),
      },
      {
        accessorKey: 'FileLocation',
        header: 'Link / File Location',
        mantineEditTextInputProps: {
          placeholder: 'https://... (optional)',
        },
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value ? (
            <Anchor href={value} target="_blank" style={{ wordBreak: 'break-all' }}>
              {value}
            </Anchor>
          ) : (
            '-'
          );
        },
      },
    ],
    [createDate]
  );

  const confirmDelete = (event: Event): void => {
    modals.openConfirmModal({
      title: 'Delete event',
      children: (
        <Text size="sm">
          Are you sure you want to delete &quot;{event.EventTitle || 'Untitled'}
          &quot;?
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteEvent(event.EventID);
          notifications.show({
            title: 'Success',
            message: 'The event has been deleted.',
            color: 'green',
          });
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: errorMessage(error, 'Failed to delete event'),
            color: 'red',
          });
        }
      },
    });
  };

  const table = useMantineReactTable({
    columns,
    data: events,
    enableEditing: true,
    createDisplayMode: 'modal',
    enableRowActions: true,
    positionActionsColumn: 'last',
    getRowId: (row) => String(row.EventID),
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enablePagination: true,
    initialState: {
      density: 'xs',
      sorting: [{ id: 'EventDate', desc: true }],
    },
    state: { isLoading: loading },
    mantinePaperProps: { withBorder: true, shadow: 'sm', radius: 'md' },
    mantineTableProps: { style: { width: '100%' } },
    mantineTableHeadCellProps: {
      style: {
        paddingTop: 6,
        paddingBottom: 6,
        backgroundColor: '#2f4b7c',
        color: '#ffffff',
        borderRight: '1px solid rgba(255, 255, 255, 0.25)',
      },
    },
    mantineTableBodyCellProps: {
      style: {
        paddingTop: 2,
        paddingBottom: 2,
        borderRight: '1px solid var(--mantine-color-gray-3)',
      },
    },
    onCreatingRowSave: async ({ values, exitCreatingMode }) => {
      const title = String(values.EventTitle ?? '').trim();
      const eventDate = toDateString(createDate);
      if (!title) {
        notifications.show({
          message: 'Please input the event title.',
          color: 'red',
        });
        return;
      }
      if (!eventDate) {
        notifications.show({
          message: 'Please select the event date.',
          color: 'red',
        });
        return;
      }
      try {
        await addEvent({
          EventTitle: title,
          EventDate: eventDate,
          FileLocation: String(values.FileLocation ?? '').trim(),
        });
        notifications.show({
          title: 'Success',
          message: 'The event has been added.',
          color: 'green',
        });
        exitCreatingMode();
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: errorMessage(error, 'Failed to add event'),
          color: 'red',
        });
      }
    },
    renderRowActions: ({ row }) => (
      <ActionIcon
        color="red"
        variant="subtle"
        onClick={() => confirmDelete(row.original)}
        aria-label="Delete event"
      >
        <IconTrash size={18} />
      </ActionIcon>
    ),
    renderTopToolbarCustomActions: () => (
      <Button
        onClick={() => {
          setCreateDate(null);
          table.setCreatingRow(true);
        }}
        leftSection={<IconCalendarPlus size={18} />}
        style={{ backgroundColor: '#2665E5' }}
      >
        Add Event
      </Button>
    ),
  });

  return (
    <Container fluid px="md" py="lg">
      <Title order={3} ta="center" mb="md">
        CPD Events Posting
      </Title>
      <MantineReactTable table={table} />
    </Container>
  );
}
