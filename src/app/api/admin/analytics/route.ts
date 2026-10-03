import { createUnauthorizedResponse, isAdminAuthorized } from '@/lib/admin/content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return createUnauthorizedResponse();
  }

  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) {
    return Response.json({ message: 'Analytics is not configured.' }, { status: 503 });
  }

  const now = new Date();
  const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const base = new URL('https://api.vercel.com/v1/query/web-analytics/visits/aggregate');
  base.searchParams.set('projectId', projectId);
  base.searchParams.set('since', since.toISOString());
  base.searchParams.set('until', now.toISOString());
  if (process.env.VERCEL_TEAM_ID) {
    base.searchParams.set('teamId', process.env.VERCEL_TEAM_ID);
  }

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const countUrl = new URL(base);
    countUrl.pathname = '/v1/query/web-analytics/visits/count';
    const pagesUrl = new URL(base);
    pagesUrl.searchParams.set('by', 'requestPath');
    pagesUrl.searchParams.set('limit', '5');
    const [countResponse, pagesResponse] = await Promise.all([
      fetch(countUrl, { headers, cache: 'no-store' }),
      fetch(pagesUrl, { headers, cache: 'no-store' }),
    ]);
    if (!countResponse.ok || !pagesResponse.ok) {
      throw new Error('Vercel Analytics query failed');
    }
    const count = await countResponse.json() as { data: { pageviews: number; visitors: number } };
    const pages = await pagesResponse.json() as { data: Array<{ requestPath: string; pageviews: number; visitors: number }> };
    return Response.json({ count: count.data, pages: pages.data }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch {
    return Response.json({ message: 'Failed to load Vercel Analytics.' }, { status: 502 });
  }
}
