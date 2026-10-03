"use client"

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { Profile } from '@/types/platform-config';
import { useDynamicTheme } from '@/lib/useDynamicTheme';

export function ThemeProvider({
  children,
  profile,
  ...props
}: React.ComponentProps<typeof NextThemesProvider> & { profile: Profile }) {
  const ready = useDynamicTheme(profile);

    return <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        forcedTheme={props.forcedTheme}
        themes={["light", "dark"]}
        {...props}
    >
      {!ready && (
        <div role="status" aria-label="Loading" className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <span className="size-6 rounded-full border-2 border-foreground/15 border-t-foreground/60 motion-safe:animate-spin" />
          <span className="sr-only">Loading</span>
        </div>
      )}
      <div className={ready ? 'contents' : 'hidden'}>{children}</div>
    </NextThemesProvider>
}
