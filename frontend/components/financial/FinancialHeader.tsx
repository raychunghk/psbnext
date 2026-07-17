'use client';

import { Title } from '@mantine/core';

export const FinancialHeader: React.FC = () => {
  return (
    <Title
      order={4}
      c="white"
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontWeight: 700,
        letterSpacing: 0.3,
        whiteSpace: 'nowrap',
        lineHeight: 1.1,
      }}
    >
      Financial Statements - Report Management System
    </Title>
  );
};
