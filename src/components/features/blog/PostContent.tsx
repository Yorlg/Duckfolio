'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { BlogPost } from '@/lib/blog';

export function PostContent({ post, contentHtml }: { post: BlogPost; contentHtml: string }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage === 'en' ? 'en' : 'zh-CN';
  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString(language, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <article className="mx-auto w-full max-w-3xl px-4 pb-20 pt-24 md:pt-32">
      <Link
        href="/posts"
        className="mb-10 inline-flex items-center gap-2 text-sm text-[#121212]/50 transition-colors hover:text-[#121212] dark:text-white/50 dark:hover:text-white"
      >
        <ArrowLeft size={16} />
        {t('post.back')}
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl/tight font-semibold text-[#121212] dark:text-white sm:text-5xl">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-5 text-lg/8 text-[#121212]/60 dark:text-white/60">
            {post.description}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[#121212]/40 dark:text-white/40">
          {formattedDate && <time dateTime={post.date}>{formattedDate}</time>}
          {post.readingTime && <span>{post.readingTime}</span>}
          {post.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded bg-[#121212]/6 px-2 py-0.5 text-[#121212]/60 dark:bg-white/8 dark:text-white/60"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div
        className="prose max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </article>
  );
}
