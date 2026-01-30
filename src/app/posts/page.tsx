import { Blog } from '@/components/features/blog';
import { getAllPosts } from '@/lib/blog';

export default async function PostsPage() {
  const posts = getAllPosts();
  return <Blog posts={posts} />;
}
