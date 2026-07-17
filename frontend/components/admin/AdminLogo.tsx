'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Group, Stack, Text } from '@mantine/core';
import { assetPath } from '@/lib/config';

export const AdminLogo: React.FC = () => {
  return (
    <Link
      href="/"
      style={{ textDecoration: 'none', color: 'inherit' }}
      aria-label="Go to home page"
    >
      <Group gap="xs" wrap="nowrap" align="center">
        <Image
          src={assetPath('/archsdlogo.png')}
          alt="Architectural Services Department logo"
          width={40}
          height={36}
          priority
        />
        <Stack gap={0}>
          <Text
            fw={700}
            style={{ fontSize: 15, lineHeight: 1.15, letterSpacing: 1 }}
          >
            建築署
          </Text>
          <Text c="dimmed" style={{ fontSize: 10, lineHeight: 1.15 }}>
            Architectural Services Department
          </Text>
        </Stack>
      </Group>
    </Link>
  );
};
