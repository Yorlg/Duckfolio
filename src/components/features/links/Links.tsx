'use client';

import { motion } from 'framer-motion';
import { ExternalLink, ChevronRight } from 'lucide-react';
import { WebsiteLink } from '@/types/platform-config';

interface LinksProps {
  websiteLinks: WebsiteLink[];
}

export function Links({ websiteLinks }: LinksProps) {
  return (
    <div className="mx-auto w-full pt-24 md:pt-32 pb-16">
      <motion.h2
        className="text-2xl sm:text-3xl font-bold mb-8 md:mb-12 flex items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <span className="bg-[var(--theme-primary)]/10 dark:bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] dark:text-[var(--theme-secondary)] p-3 rounded-xl mr-4 flex items-center justify-center">
          <ExternalLink size={24} />
        </span>
        我的链接
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {websiteLinks.map((link, index) => (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-primary)]/20 to-[var(--theme-secondary)]/20 dark:from-[var(--theme-primary)]/10 dark:to-[var(--theme-secondary)]/10 rounded-2xl transform origin-left group-hover:scale-x-[1.02] transition-transform duration-300" />
              <div className="relative flex items-center justify-between bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#121212]/5 dark:border-white/5 p-4 sm:p-6 group-hover:border-[var(--theme-primary)]/30 dark:group-hover:border-[var(--theme-secondary)]/30 transition-colors duration-300">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-medium text-[#121212] dark:text-white group-hover:text-[var(--theme-primary)] dark:group-hover:text-[var(--theme-secondary)] transition-colors duration-300">
                    {link.title}
                  </h3>
                  {link.description && (
                    <p className="text-sm sm:text-base text-[#121212]/70 dark:text-white/70 mt-2">
                      {link.description}
                    </p>
                  )}
                </div>
                <div className="text-[#121212]/40 dark:text-white/40 group-hover:text-[var(--theme-primary)] dark:group-hover:text-[var(--theme-secondary)] transform group-hover:translate-x-1 transition-all duration-300">
                  <ChevronRight size={24} />
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
