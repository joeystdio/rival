import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { competitors, monitoredUrls, users } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

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
      return NextResponse.json({ competitors: [] });
    }

    const userCompetitors = await db.query.competitors.findMany({
      where: eq(competitors.userId, dbUser.id),
      orderBy: [desc(competitors.createdAt)]
    });

    return NextResponse.json({ competitors: userCompetitors });
  } catch (error) {
    console.error('Error fetching competitors:', error);
    return NextResponse.json({ error: 'Failed to fetch competitors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, website, description, urls } = body;

    if (!name || !website) {
      return NextResponse.json({ error: 'Name and website are required' }, { status: 400 });
    }

    // Get or create user
    let dbUser = await db.query.users.findFirst({
      where: eq(users.email, user.email)
    });

    if (!dbUser) {
      const [newUser] = await db.insert(users).values({
        email: user.email,
        name: user.name
      }).returning();
      dbUser = newUser;
    }

    // Create competitor
    const [competitor] = await db.insert(competitors).values({
      userId: dbUser.id,
      name,
      website,
      description,
    }).returning();

    // Create monitored URLs
    if (urls && urls.length > 0) {
      for (const urlItem of urls) {
        if (urlItem.url.trim()) {
          await db.insert(monitoredUrls).values({
            competitorId: competitor.id,
            url: urlItem.url.trim(),
            urlType: urlItem.type || 'homepage',
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      competitor 
    });
  } catch (error) {
    console.error('Error creating competitor:', error);
    return NextResponse.json({ error: 'Failed to create competitor' }, { status: 500 });
  }
}
