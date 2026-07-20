'use client';

import { useTransition } from 'react';
import {
  AppShell,
  Box,
  Burger,
  Button,
  Group,
  LoadingOverlay,
  Progress,
  Stack,
} from '@mantine/core';
import {
  IconCalendarEvent,
  IconEdit,
  IconHome,
  IconMap,
  IconReportAnalytics,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminUiStore } from '@/lib/stores/adminUiStore';
import { AdminHeader } from './AdminHeader';
import { AdminLogo } from './AdminLogo';

interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const HEADER_HEIGHT = 64;

const NAV_LINKS: NavLink[] = [
  { label: 'Admin Home', href: '/admin', icon: <IconHome size={18} /> },
  { label: 'Upload File', href: '/admin/financial/upload', icon: <IconUpload size={18} /> },
  { label: 'Delete File', href: '/admin/financial/delete', icon: <IconTrash size={18} /> },
  { label: 'Manage Reports', href: '/admin/financial/reports', icon: <IconReportAnalytics size={18} /> },
  { label: 'Manage Districts', href: '/admin/financial/districts', icon: <IconMap size={18} /> },
  { label: 'Modify Report-District', href: '/admin/financial/modify', icon: <IconEdit size={18} /> },
  { label: 'Events', href: '/admin/events', icon: <IconCalendarEvent size={18} /> },
];

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { navOpened, toggleNav, closeNav, pendingHref, setPendingHref } =
    useAdminUiStore();

  const go = (href: string) => {
    if (href === pathname) {
      closeNav();
      return;
    }
    setPendingHref(href);
    closeNav();
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <AppShell
      layout="alt"
      header={{ height: HEADER_HEIGHT }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !navOpened } }}
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
        {isPending && (
          <Progress
            value={100}
            striped
            animated
            size="xs"
            radius={0}
            color="yellow"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }}
          />
        )}
        <Group h="100%" px="md" gap="sm" wrap="nowrap" style={{ position: 'relative' }}>
          <Burger
            opened={navOpened}
            onClick={toggleNav}
            hiddenFrom="sm"
            size="sm"
            color="white"
          />
          <AdminHeader />
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
          <AdminLogo />
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
                loading={isPending && pendingHref === link.href}
                onClick={() => go(link.href)}
              >
                {link.label}
              </Button>
            );
          })}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box style={{ position: 'relative', minHeight: '60vh' }}>
          <LoadingOverlay
            visible={isPending}
            zIndex={5}
            overlayProps={{ radius: 'sm', blur: 1 }}
          />
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
};
