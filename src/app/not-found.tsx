import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import Link from 'next/link';

async function get404Content() {
  try {
    const filePath = path.join(process.cwd(), 'posts', '404.md');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    const processedContent = await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(content);

    return {
      title: data.title || '404 - 页面未找到',
      htmlContent: processedContent.toString(),
    };
  } catch (error) {
    console.error('Error reading 404.md:', error);
    return {
      title: '404 - 页面未找到',
      htmlContent: '<h1>404</h1><p>页面未找到</p>',
    };
  }
}

export default async function NotFound() {
  const { htmlContent } = await get404Content();

  return (
    <div className="flex flex-col items-center justify-center flex-1 min-h-screen">
      <div className="text-center space-y-8">
        <div
          className="text-6xl font-light text-[#121212] dark:text-white"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <Link
          href="/"
          className="inline-block text-sm text-[#121212]/60 dark:text-white/60 hover:text-[#121212] dark:hover:text-white transition-colors"
        >
          cd ..
        </Link>
      </div>
    </div>
  );
}
