'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Group, Stack, Text } from '@mantine/core';
import { assetPath } from '@/lib/config';

export const AdminLogo: React.FC = () => {
  return (
    <Link
      href="https://psbiis/"
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
            fw={600}
            style={{ fontSize: 17, lineHeight: 1.3, letterSpacing: 1 }}
          >
            建築署
          </Text>
          <Text fw={500} style={{fontFamily:'Helvetica LT Narrow Regular', fontSize: 12, lineHeight: 1.2, letterSpacing: 0.1}}>
            Architectural Services Department
          </Text>
        </Stack>
      </Group>
    </Link>
  );
};
