'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  readingTime?: string;
}

interface BlogProps {
  posts: BlogPost[];
}

export function Blog({ posts }: BlogProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage === 'en' ? 'en' : 'zh-CN';
  const reducedMotion = useReducedMotion();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const groupPostsByYear = (posts: BlogPost[]) => {
    const groups: Record<string, BlogPost[]> = {};
    posts.forEach((post) => {
      if (!post.date) return;
      const year = new Date(post.date).getFullYear().toString();
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(post);
    });
    return groups;
  };

  const postsByYear = groupPostsByYear(posts);
  const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 pb-24 pt-28">
      <motion.header
        className="mx-auto mb-16 max-w-4xl px-5 text-center"
        initial={{ opacity: 1, y: reducedMotion ? 0 : 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <h1 className="text-4xl font-semibold tracking-normal text-[#121212] dark:text-white">{t('nav.blog')}</h1>
        <p className="mt-3 text-lg italic text-[#121212]/45 dark:text-white/45">{t('blog.description')}</p>
        <div className="mx-auto mt-10 h-px w-12 bg-[#121212]/15 dark:bg-white/15" />
      </motion.header>
      <div className={`w-full px-5 sm:px-8 ${years.length ? 'lg:pl-[260px] lg:pr-8' : 'lg:px-8'}`}>
        <motion.div
          className="mx-auto w-full max-w-7xl"
          initial={{ opacity: 1, y: reducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {years.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-[#121212]/30 dark:text-white/30">
                {t('blog.empty')}
              </p>
              <a
                href="/admin"
                className="text-sm text-[#121212]/40 dark:text-white/40 hover:text-[#121212] dark:hover:text-white transition-colors mt-3 inline-block"
              >
                {t('blog.create')}
              </a>
            </div>
          ) : (
            <div className="space-y-10">
              {years.map((year, yearIndex) => (
                <section key={year} className="relative" aria-labelledby={`year-${year}`}>
                  <h2 id={`year-${year}`} className="pointer-events-none select-none font-condensed text-[clamp(4.25rem,7.6vw,5.8rem)] font-normal leading-[0.86] text-transparent [-webkit-text-stroke:2px_rgba(18,18,18,0.12)] dark:[-webkit-text-stroke:2px_rgba(255,255,255,0.14)]">
                    {year}
                  </h2>
                  <div className="relative mt-1 grid gap-x-10 gap-y-5 pl-4 sm:pl-10 md:mt-2 md:grid-cols-2 xl:pl-20">
                    {postsByYear[year].map((post, index) => {
                      const postDate = new Date(post.date);
                      const formattedDate = isClient
                        ? postDate.toLocaleDateString(language, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : postDate.toLocaleDateString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                          });

                      return (
                        <Link key={post.slug} href={`/posts/${post.slug}`} className="min-w-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground">
                          <motion.div
                            initial={{ opacity: 1, y: reducedMotion ? 0 : 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.5,
                              delay: yearIndex * 0.2 + index * 0.1,
                              ease: 'easeOut',
                            }}
                            className="group flex h-full min-h-20 flex-col gap-2 rounded-md px-4 py-4 transition-colors hover:bg-[#121212]/5 dark:hover:bg-white/10"
                          >
                            {post.tags && post.tags.length > 0 && (
                              <span className="text-[13px] px-2 py-0.5 rounded-[4px] bg-[#121212]/6 dark:bg-white/6 text-[#121212]/60 dark:text-white/60 shrink-0 w-fit">
                                {post.tags[0]}
                              </span>
                            )}
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                              <h3 className="break-words text-lg font-medium text-[#121212]/55 transition-colors group-hover:text-[#121212] dark:text-white/55 dark:group-hover:text-white">
                                {post.title}
                              </h3>
                              {post.description && <p className="break-words text-sm leading-5 text-[#121212]/30 transition-colors group-hover:text-[#121212]/55 dark:text-white/30 dark:group-hover:text-white/55">{post.description}</p>}
                              <div className="flex items-center gap-2 text-sm text-[#121212]/30 dark:text-white/30 whitespace-nowrap font-light">
                                <time
                                  dateTime={new Date(post.date).toISOString()}
                                >
                                  {formattedDate}
                                </time>
                                {post.readingTime && (
                                  <>
                                    <span>·</span>
                                    <span>{post.readingTime}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
