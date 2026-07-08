import type React from 'react';
import '../styles/globals.css';
import { getConfig } from '@/lib/config';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ModeToggle } from '@/components/theme/toggle-theme';
// import { CustomCursor } from '@/components/interactive/custom-cursor';
import { RootLayoutClient } from '@/components/layout/RootLayoutClient';
import { Analytics } from '@vercel/analytics/next';

export function generateMetadata(): Metadata {
  const config = getConfig();

  return {
    title: config.profile.name,
    description: config.profile.bio,
    icons: {
      icon: '/logo.png',
      shortcut: '/logo.png',
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="h-full" suppressHydrationWarning>
      <body className="h-full bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ModeToggle />
          {/* <CustomCursor /> */}
          <RootLayoutClient>{children}</RootLayoutClient>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
