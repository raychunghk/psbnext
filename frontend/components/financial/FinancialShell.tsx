'use client';

import { AppShell, Box, Burger, Button, Group, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconUpload,
  IconTrash,
  IconEdit,
  IconMap,
  IconReportAnalytics,
} from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { FinancialHeader } from './FinancialHeader';
import { FinancialLogo } from './FinancialLogo';

interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const HEADER_HEIGHT = 64;

const NAV_LINKS: NavLink[] = [
  { label: 'Upload File', href: '/admin/financial/upload', icon: <IconUpload size={18} /> },
  { label: 'Delete File', href: '/admin/financial/delete', icon: <IconTrash size={18} /> },
  { label: 'Manage Reports', href: '/admin/financial/reports', icon: <IconReportAnalytics size={18} /> },
  { label: 'Manage Districts', href: '/admin/financial/districts', icon: <IconMap size={18} /> },
  { label: 'Modify Report-District', href: '/admin/financial/modify', icon: <IconEdit size={18} /> },
];

export const FinancialShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [opened, { toggle, close }] = useDisclosure();
  const router = useRouter();
  const pathname = usePathname();

  const go = (href: string) => {
    router.push(href);
    close();
  };

  return (
    <AppShell
      layout="alt"
      header={{ height: HEADER_HEIGHT }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      styles={{
        main: { backgroundColor: '#f8f9fa' },
        navbar: { backgroundColor: '#ffffff' },
      }}
    >
      <AppShell.Header
        withBorder={false}
        style={{
          background: 'linear-gradient(90deg, #2f4b7c 0%, #3b5b8c 100%)',
        }}
      >
        <Group h="100%" px="md" gap="sm" wrap="nowrap" style={{ position: 'relative' }}>
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            color="white"
          />
          <FinancialHeader />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <Box
          h={HEADER_HEIGHT}
          px="md"
          style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid var(--mantine-color-gray-3)',
          }}
        >
          <FinancialLogo />
        </Box>
        <Stack gap="sm" p="md">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Button
                key={link.href}
                fullWidth
                justify="space-between"
                rightSection={link.icon}
                variant={active ? 'filled' : 'light'}
                color={active ? 'blue' : 'gray'}
                onClick={() => go(link.href)}
              >
                {link.label}
              </Button>
            );
          })}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};
