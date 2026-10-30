import { readRepositoryPhoto } from '@/lib/admin/photos';
import { photoContentType } from '@/lib/photos';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const filePath = (await context.params).path.join('/');
    const content = await readRepositoryPhoto(filePath);
    if (!content) return new Response('Not found', { status: 404 });
    return new Response(new Uint8Array(content), {
      headers: {
        'Content-Type': photoContentType(filePath)!,
        'Cache-Control': 'public, max-age=60, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Unable to read photo', { status: 500 });
  }
}
