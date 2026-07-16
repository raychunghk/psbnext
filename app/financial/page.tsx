'use client';

import { Container, Paper, Stack, Text, Title } from '@mantine/core';

export default function FinancialHome() {
  return (
    <Container size="md" py="xl">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Stack gap="sm" align="center">
          <Title order={3}>Welcome</Title>
          <Text c="dimmed" ta="center">
            Use the menu to upload a report file, delete a file, or modify the
            report-district table.
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
}
