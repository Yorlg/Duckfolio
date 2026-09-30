import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { renderMarkdownToHtml } from '@/lib/markdown';
import { PostContent } from '@/components/features/blog/PostContent';

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamicParams = true;
export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const contentHtml = await renderMarkdownToHtml(post.content);
  return <PostContent post={post} contentHtml={contentHtml} />;
}
