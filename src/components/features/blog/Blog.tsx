'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
}

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then((res) => res.json() as Promise<BlogPost[]>)
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch posts:', error);
        setLoading(false);
      });
  }, []);

  const groupPostsByYear = (posts: BlogPost[]) => {
    const groups: Record<string, BlogPost[]> = {};
    posts.forEach((post) => {
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

  if (loading) {
    return (
      <div className="flex flex-col justify-center flex-1 py-20">
        <div className="max-w-3xl mx-auto w-full">
          <p className="text-center text-[#121212]/40 dark:text-white/40">
            加载中...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center flex-1 py-20">
      <div className="max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8"
        >
          {years.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#121212]/40 dark:text-white/40">
                暂无博客文章
              </p>
              <p className="text-sm text-[#121212]/30 dark:text-white/30 mt-2">
                访问{' '}
                <a href="/admin" className="underline">
                  /admin
                </a>{' '}
                创建你的第一篇文章
              </p>
            </div>
          ) : (
            years.map((year) => (
              <div key={year} className="space-y-4 pt-8 first:pt-0">
                <h2 className="text-6xl font-light text-[#121212]/10 dark:text-white/10">
                  {year}
                </h2>
                {postsByYear[year].map((post, index) => {
                  const postDate = new Date(post.date);
                  const formattedDate = postDate.toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <Link key={post.slug} href={`/blog/${post.slug}`}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.1 + index * 0.05,
                        }}
                        className="group cursor-pointer"
                      >
                        <div className="flex items-baseline gap-4 py-2 hover:bg-[#121212]/5 dark:hover:bg-white/5 px-2 -mx-2 rounded-lg transition-colors">
                          <h3 className="text-lg flex-1 group-hover:text-[#121212] dark:group-hover:text-white transition-colors">
                            {post.title}
                          </h3>
                          <span className="text-sm text-[#121212]/40 dark:text-white/40 whitespace-nowrap">
                            {formattedDate}
                          </span>
                        </div>
                        {post.description && (
                          <p className="text-sm text-[#121212]/60 dark:text-white/60 px-2 pb-2">
                            {post.description}
                          </p>
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-2 px-2 pb-2">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-1 rounded bg-[#121212]/5 dark:bg-white/5 text-[#121212]/60 dark:text-white/60"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
