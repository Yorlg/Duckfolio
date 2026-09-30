'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { useSwipeNavigation } from '@/lib/useSwipeNavigation';
import { useProfileStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface RootLayoutClientProps {
  children: ReactNode;
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  useSwipeNavigation();
  const pathname = usePathname();
  const { profile } = useProfileStore();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip text-[#121212] dark:text-[#f0f0f0]">
      {!isAdmin && <Navigation />}
      <LanguageToggle />

      <motion.main
        className={cn(
          'relative z-10 flex-1 w-full flex flex-col',
          isAdmin
            ? 'mx-0 px-0'
            : 'mx-auto px-4 sm:px-6 md:w-4/5 md:px-8 lg:w-3/4 xl:w-2/3',
        )}
      >
        <motion.div
          key={pathname}
          initial={{ opacity: 1, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
          }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </motion.main>

      {!isAdmin && <Footer name={profile?.name || 'Duck'} />}
    </div>
  );
}
