'use client';

import { motion } from 'framer-motion';
import { TerminalSquare } from 'lucide-react';
import { ConfigIcon } from '@/lib/icon-registry';
import { useTranslation } from 'react-i18next';
import type { ProjectLink, ProjectSection } from '@/types/platform-config';

function getSectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function Projects({
  projectSections,
}: {
  projectSections: ProjectSection[];
}) {
  const { t } = useTranslation();
  const visibleSections = projectSections.filter(
    (section) => section.title && section.projects.length > 0,
  );

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 pb-24 pt-28">
      <motion.header
        className="mx-auto mb-16 max-w-4xl text-center"
        initial={{ opacity: 1, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <h1 className="text-4xl font-semibold tracking-normal text-[#121212] dark:text-white">
          {t('projects.heading')}
        </h1>
        <p className="mt-3 text-lg italic text-[#121212]/45 dark:text-white/45">
          {t('projects.description')}
        </p>
        <div className="mx-auto mt-10 h-px w-12 bg-[#121212]/15 dark:bg-white/15" />
      </motion.header>

      <div className="grid w-full gap-10 px-5 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:px-0">
        <aside className="group sticky top-24 hidden h-fit pl-8 lg:block">
          <div>
            <button
              className="mb-4 flex size-8 items-center justify-center text-[#121212]/75 transition-colors hover:text-[#121212] dark:text-white/70 dark:hover:text-white"
              type="button"
              aria-label={t('projects.categories')}
            >
              <span className="grid w-4 gap-1">
                <span className="h-px w-full bg-current" />
                <span className="h-px w-full bg-current" />
                <span className="h-px w-2.5 bg-current" />
              </span>
            </button>
            <nav className="grid translate-x-[-4px] gap-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100">
              {visibleSections.map((section) => (
                <a
                  key={section.title}
                  className="text-sm text-[#121212]/45 transition-colors hover:text-[#121212] dark:text-white/45 dark:hover:text-white"
                  href={`#${getSectionId(section.title)}`}
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <main className="mx-auto grid w-full max-w-7xl gap-10 lg:pr-8">
          {visibleSections.map((section, sectionIndex) => (
            <motion.section
              key={section.title}
              id={getSectionId(section.title)}
              className="relative scroll-mt-28"
              initial={{ opacity: 1, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.08 * sectionIndex,
                ease: 'easeOut',
              }}
            >
              <h2 className="pointer-events-none select-none font-condensed text-[clamp(4.25rem,7.6vw,5.8rem)] font-normal leading-[0.86] text-transparent [-webkit-text-stroke:2px_rgba(18,18,18,0.12)] dark:[-webkit-text-stroke:2px_rgba(255,255,255,0.14)]">
                {section.title}
              </h2>

              <div className="relative mt-1 grid gap-x-20 gap-y-9 pl-10 md:mt-2 md:grid-cols-3 xl:pl-20">
                {section.projects.map((project) => {
                  return (
                    <a
                      key={project.id || `${section.title}-${project.title}`}
                      className="group flex min-h-20 items-center gap-5 rounded-md px-4 py-4 transition-colors hover:bg-[#121212]/5 dark:hover:bg-white/10"
                      href={project.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ConfigIcon
                        className="size-9 shrink-0 text-[#121212]/18 transition-colors group-hover:text-[#121212]/45 dark:text-white/18 dark:group-hover:text-white/45"
                        fallback={TerminalSquare}
                        icon={project.icon}
                        svgClassName="size-9 shrink-0 text-[#121212]/18 transition-colors group-hover:text-[#121212]/45 dark:text-white/18 dark:group-hover:text-white/45 [&_svg]:size-9"
                      />
                      <span className="min-w-0">
                        <span className="block text-lg font-medium text-[#121212]/55 transition-colors group-hover:text-[#121212] dark:text-white/55 dark:group-hover:text-white">
                          {project.title}
                        </span>
                        {project.description && (
                          <span className="mt-1 block text-sm leading-5 text-[#121212]/30 transition-colors group-hover:text-[#121212]/55 dark:text-white/30 dark:group-hover:text-white/55">
                            {project.description}
                          </span>
                        )}
                      </span>
                    </a>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </main>
      </div>
    </div>
  );
}
