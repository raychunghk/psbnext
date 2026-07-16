'use client';

import { Box, Title, Text } from '@mantine/core';

export const FinancialHeader: React.FC = () => {
  return (
    <Box>
      <Box
        style={{
          backgroundColor: '#2665E5',
          color: 'white',
          textAlign: 'center',
          padding: '18px 0',
        }}
      >
        <Title order={2} c="white" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
          Financial Statements
        </Title>
        <Text size="lg" c="white" fw={700} style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
          Report Management System
        </Text>
      </Box>
      <Box style={{ backgroundColor: '#0B0B9E', height: '15px' }} />
    </Box>
  );
};
