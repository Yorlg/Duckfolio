'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { ModeToggle } from '@/components/theme/toggle-theme';
import { useSwipeNavigation } from '@/lib/useSwipeNavigation';
import { cn } from '@/lib/utils';

interface RootLayoutClientProps {
  children: ReactNode;
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  useSwipeNavigation();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isPhotos = pathname === '/photos';
  const controls = (
    <div className="flex shrink-0 items-center gap-1 sm:gap-3">
      <LanguageToggle />
      <ModeToggle />
    </div>
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip text-[#121212] dark:text-[#f0f0f0]">
      <header
        className={cn(
          'inset-x-0 top-0 z-40 w-full bg-background/90 px-4 py-2 backdrop-blur-md sm:px-8 sm:py-5',
          isAdmin ? 'sticky' : 'fixed',
        )}
      >
        <div className="site-header-content">
          {isAdmin ? (
            <div className="flex justify-end">{controls}</div>
          ) : (
            <Navigation>{controls}</Navigation>
          )}
        </div>
      </header>

      <main
        className={cn(
          'relative z-10 flex w-full flex-1 flex-col',
          isAdmin
            ? 'z-auto mx-0 px-0'
            : isPhotos
              ? 'mx-auto px-4 sm:w-[90%] sm:px-0 lg:w-4/5 lg:max-w-[1600px]'
              : 'mx-auto px-4 sm:px-6 md:w-4/5 md:px-8 lg:w-3/4 xl:w-2/3',
        )}
      >
        {children}
      </main>

      {!isAdmin && <Footer />}
    </div>
  );
}
