import type React from 'react';
import '../styles/globals.css';
import { getConfig } from '@/lib/config';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ModeToggle } from '@/components/theme/toggle-theme';
import { CustomCursor } from '@/components/interactive/custom-cursor';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();

  return Promise.resolve({
    title: config.profile.name,
    description: config.profile.bio,
    icons: {
      icon: '/logo.png',
      shortcut: '/logo.png',
    },
  });
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="h-full" suppressHydrationWarning>
      <body
        className={`${inter.className} h-full bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ModeToggle />
          <CustomCursor />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
