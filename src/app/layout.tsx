import { Analytics } from '@vercel/analytics/next';
import type React from 'react';
import '../styles/globals.css';
import { getConfig } from '@/lib/config';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ModeToggle } from '@/components/theme/toggle-theme';
// import { CustomCursor } from '@/components/interactive/custom-cursor';
import { RootLayoutClient } from '@/components/layout/RootLayoutClient';
import { LanguageProvider } from '@/components/layout/LanguageProvider';
import { getMessages } from '@/lib/locales';
import { validAvatarTheme } from '@/lib/avatar-theme';

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
  const { profile } = getConfig();
  const theme = validAvatarTheme(profile.theme, profile.avatar) ? profile.theme : undefined;
  return (
    <html lang="zh-CN" className="h-full" suppressHydrationWarning style={theme ? { '--theme-primary': theme.primary, '--theme-secondary': theme.secondary } as React.CSSProperties : undefined}>
      <body className="h-full bg-background text-foreground">
        <ThemeProvider
          profile={profile}
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ModeToggle />
          {/* <CustomCursor /> */}
          <LanguageProvider translations={getMessages()}>
            <RootLayoutClient>{children}</RootLayoutClient>
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
