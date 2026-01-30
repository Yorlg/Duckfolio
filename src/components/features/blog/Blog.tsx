'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

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
    <div className="flex flex-col justify-center flex-1 py-20">
      <div className="max-w-3xl mx-auto w-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {years.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-[#121212]/30 dark:text-white/30">
                暂无博客文章
              </p>
              <a
                href="/admin"
                className="text-sm text-[#121212]/40 dark:text-white/40 hover:text-[#121212] dark:hover:text-white transition-colors mt-3 inline-block"
              >
                创建你的第一篇文章 →
              </a>
            </div>
          ) : (
            <div className="space-y-20 md:space-y-32">
              {years.map((year, yearIndex) => (
                <div key={year} className="relative">
                  <div className="absolute -left-7 md:-left-20 -top-4 md:-top-16 text-[5rem] md:text-[10rem] font-light text-[#121212]/[0.05] md:text-[#121212]/[0.035] dark:text-white/[0.05] md:dark:text-white/[0.035] leading-none select-none pointer-events-none -z-10">
                    {year}
                  </div>
                  <div className="space-y-5 md:space-y-8 relative pt-4 md:pt-6">
                    {postsByYear[year].map((post, index) => {
                      const postDate = new Date(post.date);
                      const formattedDate = isClient
                        ? postDate.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : postDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          });

                      return (
                        <Link key={post.slug} href={`/posts/${post.slug}`}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.5,
                              delay: yearIndex * 0.2 + index * 0.1,
                              ease: 'easeOut',
                            }}
                            className="group py-2 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4"
                          >
                            {post.tags && post.tags.length > 0 && (
                              <span className="text-[13px] px-2 py-0.5 rounded-[4px] bg-[#121212]/[0.06] dark:bg-white/[0.06] text-[#121212]/60 dark:text-white/60 shrink-0 w-fit">
                                {post.tags[0]}
                              </span>
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 flex-1 min-w-0">
                              <h3 className="text-lg sm:text-xl font-normal text-[#121212]/90 dark:text-white/90 group-hover:opacity-60 transition-opacity">
                                {post.title}
                              </h3>
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
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
