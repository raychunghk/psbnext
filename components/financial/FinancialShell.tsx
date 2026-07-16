'use client';

import { AppShell, Burger, Button, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconUpload, IconTrash, IconEdit } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { FinancialHeader } from './FinancialHeader';

interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Upload File', href: '/financial/upload', icon: <IconUpload size={18} /> },
  { label: 'Delete File', href: '/financial/delete', icon: <IconTrash size={18} /> },
  { label: 'Modify Report-District', href: '/financial/modify', icon: <IconEdit size={18} /> },
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
      header={{ height: 90 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
          style={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}
          color="white"
        />
        <FinancialHeader />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="sm">
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
