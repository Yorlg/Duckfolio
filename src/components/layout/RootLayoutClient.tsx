'use client';

import { ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { useSwipeNavigation } from '@/lib/useSwipeNavigation';
import { useProfileStore } from '@/lib/store';

interface RootLayoutClientProps {
  children: ReactNode;
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const { dragProps } = useSwipeNavigation();
  const pathname = usePathname();
  const { profile } = useProfileStore();

  return (
    <div className="relative min-h-screen w-full text-[#121212] dark:text-[#f0f0f0] overflow-hidden flex flex-col">
      <Navigation />

      <motion.main
        className="relative z-10 flex-1 px-4 sm:px-6 md:px-8 w-full md:w-4/5 lg:w-3/4 xl:w-2/3 mx-auto flex flex-col"
        {...dragProps}
      >
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
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

      <Footer name={profile?.name || 'Duck'} />
    </div>
  );
}
