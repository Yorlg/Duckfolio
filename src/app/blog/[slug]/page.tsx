'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { remark } from 'remark';
import html from 'remark-html';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  content: string;
}

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/posts/${slug}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Post not found');
        }
        return res.json() as Promise<BlogPost>;
      })
      .then(async (data) => {
        setPost(data);
        // 将 markdown 转换为 HTML
        const processedContent = await remark().use(html).process(data.content);
        setHtmlContent(processedContent.toString());
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch post:', error);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#121212]/40 dark:text-white/40">加载中...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#121212]/40 dark:text-white/40 mb-4">
            文章未找到
          </p>
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push('/posts');
              }
            }}
            className="text-[#121212] dark:text-white underline"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  const postDate = new Date(post.date);
  const formattedDate = postDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen py-20">
      <article className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push('/posts');
            }
          }}
          className="mb-8 text-[#121212]/60 dark:text-white/60 hover:text-[#121212] dark:hover:text-white transition-colors"
        >
          ← 返回
        </button>

        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#121212] dark:text-white">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-[#121212]/60 dark:text-white/60">
            <time>{formattedDate}</time>
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded bg-[#121212]/5 dark:bg-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {post.description && (
            <p className="mt-4 text-lg text-[#121212]/80 dark:text-white/80">
              {post.description}
            </p>
          )}
        </header>

        <div
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:text-[#121212] dark:prose-headings:text-white
            prose-p:text-[#121212]/80 dark:prose-p:text-white/80
            prose-a:text-[#121212] dark:prose-a:text-white
            prose-strong:text-[#121212] dark:prose-strong:text-white
            prose-code:text-[#121212] dark:prose-code:text-white
            prose-pre:bg-[#121212]/5 dark:prose-pre:bg-white/5
            prose-blockquote:border-[#121212]/20 dark:prose-blockquote:border-white/20"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>
    </div>
  );
}
