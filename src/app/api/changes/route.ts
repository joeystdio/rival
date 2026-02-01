import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { changes, monitoredUrls, competitors, users, snapshots } from '@/lib/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, user.email)
    });

    if (!dbUser) {
      return NextResponse.json({ changes: [] });
    }

    // Get user's competitors
    const userCompetitors = await db.query.competitors.findMany({
      where: eq(competitors.userId, dbUser.id)
    });

    if (userCompetitors.length === 0) {
      return NextResponse.json({ changes: [] });
    }

    const competitorIds = userCompetitors.map(c => c.id);

    // Get monitored URLs for these competitors
    const urls = await db.query.monitoredUrls.findMany({
      where: inArray(monitoredUrls.competitorId, competitorIds)
    });

    if (urls.length === 0) {
      return NextResponse.json({ changes: [] });
    }

    const urlIds = urls.map(u => u.id);

    // Get changes for these URLs
    const recentChanges = await db.query.changes.findMany({
      where: inArray(changes.urlId, urlIds),
      orderBy: [desc(changes.detectedAt)],
      limit: 50
    });

    // Enrich with competitor and URL info
    const enrichedChanges = recentChanges.map(change => {
      const url = urls.find(u => u.id === change.urlId);
      const competitor = url ? userCompetitors.find(c => c.id === url.competitorId) : null;
      
      return {
        ...change,
        competitorName: competitor?.name || 'Unknown',
        competitorId: competitor?.id,
        urlType: url?.urlType || 'unknown',
        url: url?.url,
      };
    });

    return NextResponse.json({ changes: enrichedChanges });
  } catch (error) {
    console.error('Error fetching changes:', error);
    return NextResponse.json({ error: 'Failed to fetch changes' }, { status: 500 });
  }
}

// Mark change as read
export async function PATCH(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { changeId } = body;

    if (!changeId) {
      return NextResponse.json({ error: 'Change ID required' }, { status: 400 });
    }

    await db
      .update(changes)
      .set({ readAt: new Date() })
      .where(eq(changes.id, changeId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update change' }, { status: 500 });
  }
}
