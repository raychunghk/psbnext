'use client';

import { Box, Title } from '@mantine/core';

export const EventHeader: React.FC = () => {
  return (
    <>
      <Box
        style={{
          backgroundColor: '#2665E5',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        <Title order={1} c="white">CPD Events Posting</Title>
      </Box>
      <Box
        style={{
          backgroundColor: '#0B0B9E',
          height: '4px',
          borderRadius: '2px',
        }}
      />
    </>
  );
};