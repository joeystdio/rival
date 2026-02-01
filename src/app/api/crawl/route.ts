import { NextRequest, NextResponse } from 'next/server';
import { runDailyCrawl, processMonitoredUrl } from '@/lib/crawler';

// Secret key to authorize cron jobs
const CRON_SECRET = process.env.CRON_SECRET || 'rival-cron-secret-change-me';

/**
 * POST /api/crawl
 * Trigger a crawl job. Can be called by cron or manually by admin.
 * 
 * Headers:
 *   Authorization: Bearer <CRON_SECRET>
 * 
 * Body (optional):
 *   { "urlId": "uuid" } - Crawl a specific URL
 *   {} or no body - Run full daily crawl
 */
export async function POST(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));

    if (body.urlId) {
      // Crawl specific URL
      const hasChanged = await processMonitoredUrl(body.urlId);
      return NextResponse.json({ 
        success: true, 
        urlId: body.urlId,
        changed: hasChanged 
      });
    } else {
      // Run full daily crawl
      const result = await runDailyCrawl();
      return NextResponse.json({ 
        success: true, 
        ...result 
      });
    }
  } catch (error: any) {
    console.error('Crawl error:', error);
    return NextResponse.json({ 
      error: 'Crawl failed', 
      message: error.message 
    }, { status: 500 });
  }
}

/**
 * GET /api/crawl
 * Get crawl status and stats
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return basic stats
  return NextResponse.json({
    status: 'ready',
    message: 'Crawl endpoint is operational',
  });
}
