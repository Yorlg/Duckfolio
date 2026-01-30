import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import Link from 'next/link';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // 将 markdown 转换为 HTML
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(post.content);
  const htmlContent = processedContent.toString();

  const postDate = new Date(post.date);
  const formattedDate = postDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen py-20">
      <article className="max-w-3xl mx-auto px-4">
        <Link
          href="/posts"
          className="inline-block mb-8 text-[#121212]/60 dark:text-white/60 hover:text-[#121212] dark:hover:text-white transition-colors"
        >
          ← 返回
        </Link>

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
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>
    </div>
  );
}
