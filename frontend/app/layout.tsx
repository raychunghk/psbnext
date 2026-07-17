import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-react-table-open/styles.css';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import React from 'react';
import { theme } from '../theme';
import { assetPath } from '@/lib/config';
export const metadata = {
  title: 'Mantine Next.js template',
  description: 'I am using Mantine with Next.js!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href={assetPath('/archsdlogo.png')} />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Notifications />
          <ModalsProvider>{children}</ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}