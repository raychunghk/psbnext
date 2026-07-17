'use client';

import { Group, Title } from '@mantine/core';

export const FinancialHeader: React.FC = () => {
  return (
    <Group
      h="100%"
      px="md"
      justify="center"
      align="center"
      style={{
        background: 'linear-gradient(90deg, #2f4b7c 0%, #3b5b8c 100%)',
        color: 'white',
      }}
    >
      <Title
        order={4}
        c="white"
        style={{
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontWeight: 700,
          letterSpacing: 0.3,
          textAlign: 'center',
          lineHeight: 1.1,
        }}
      >
        Financial Statements - Report Management System
      </Title>
    </Group>
  );
};
