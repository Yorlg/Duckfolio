'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Globe2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WebsiteLink } from '@/types/platform-config';

export function Links({ websiteLinks }: { websiteLinks: WebsiteLink[] }) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 pb-24 pt-28">
      <motion.header
        className="mx-auto mb-14 max-w-4xl px-5 text-center"
        initial={{ opacity: 1, y: reducedMotion ? 0 : 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <h1 className="text-4xl font-semibold text-[#121212] dark:text-white">{t('links.heading')}</h1>
        <p className="mt-3 text-lg italic text-[#121212]/45 dark:text-white/45">{t('links.description')}</p>
        <div className="mx-auto mt-10 h-px w-12 bg-[#121212]/15 dark:bg-white/15" />
      </motion.header>

      <motion.div
        className="mx-auto w-full max-w-4xl px-5 sm:px-8"
        initial={{ opacity: 1, y: reducedMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {websiteLinks.length ? (
          <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {websiteLinks.map((link) => {
              let domain = '';
              try {
                domain = new URL(link.url).hostname.replace(/^www\./, '');
              } catch {
                // An incomplete configured URL should not hide the entry.
              }

              return (
                <li key={link.id} className="min-w-0">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-h-28 min-w-0 gap-4 rounded-md px-2 py-5 transition-colors hover:bg-[#121212]/[0.035] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground dark:hover:bg-white/[0.06] sm:px-3"
                  >
                    <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center text-[#121212]/40 dark:text-white/45">
                      <Globe2 className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block break-words text-xl font-medium text-[#121212] transition-colors group-hover:text-(--theme-primary) dark:text-white dark:group-hover:text-(--theme-secondary)">
                        {link.title}
                      </span>
                      {link.description && <span className="mt-1 block break-words text-sm leading-6 text-[#121212]/55 dark:text-white/55">{link.description}</span>}
                      {domain && <span className="mt-3 block truncate font-mono text-xs text-[#121212]/40 dark:text-white/40">{domain}</span>}
                    </span>
                    <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-[#121212]/40 transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 dark:text-white/40" />
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">{t('links.empty')}</p>
        )}
      </motion.div>
    </section>
  );
}
