'use client';

import { Container, Paper, SimpleGrid, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import {
  IconCalendarEvent,
  IconEdit,
  IconMap,
  IconReportAnalytics,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface AdminCard {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

const CARDS: AdminCard[] = [
  {
    label: 'Upload File',
    description: 'Upload a financial statement report file.',
    href: '/admin/financial/upload',
    icon: <IconUpload size={22} />,
  },
  {
    label: 'Delete File',
    description: 'Remove or download an uploaded report file.',
    href: '/admin/financial/delete',
    icon: <IconTrash size={22} />,
  },
  {
    label: 'Manage Reports',
    description: 'Add, rank, or delete reports.',
    href: '/admin/financial/reports',
    icon: <IconReportAnalytics size={22} />,
  },
  {
    label: 'Manage Districts',
    description: 'Add or delete districts.',
    href: '/admin/financial/districts',
    icon: <IconMap size={22} />,
  },
  {
    label: 'Modify Report-District',
    description: 'Edit the report-district value matrix.',
    href: '/admin/financial/modify',
    icon: <IconEdit size={22} />,
  },
  {
    label: 'Events',
    description: 'Post or remove CPD events.',
    href: '/admin/events',
    icon: <IconCalendarEvent size={22} />,
  },
];

export default function AdminHome() {
  const router = useRouter();

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Stack gap={4} align="center">
          <Title order={3}>Admin Home</Title>
          <Text c="dimmed" ta="center">
            Manage financial report files, the report-district matrix, and CPD
            events.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {CARDS.map((card) => (
            <UnstyledButton key={card.href} onClick={() => router.push(card.href)}>
              <Paper shadow="sm" p="lg" radius="md" withBorder h="100%">
                <Stack gap="xs">
                  {card.icon}
                  <Text fw={600}>{card.label}</Text>
                  <Text size="sm" c="dimmed">
                    {card.description}
                  </Text>
                </Stack>
              </Paper>
            </UnstyledButton>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
