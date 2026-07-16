'use client';

import { Container, Paper, Stack, Text, Title } from '@mantine/core';

export default function DeleteReportPage() {
  return (
    <Container size="sm" py="xl">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Stack gap="sm" align="center">
          <Title order={3}>Delete File</Title>
          <Text c="dimmed">This page is under construction.</Text>
        </Stack>
      </Paper>
    </Container>
  );
}
