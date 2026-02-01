import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, ROLES } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Super admin emails - add your email here
const SUPER_ADMIN_EMAILS = [
  'joey@jdms.nl',
  'joe@jdms.nl',
];

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if requesting user is super admin
  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, user.email)
  });

  if (!dbUser || dbUser.role !== ROLES.SUPER_ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const allUsers = await db.query.users.findMany();
  return NextResponse.json({ users: allUsers });
}

export async function PATCH(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if requesting user is super admin
  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, user.email)
  });

  if (!dbUser || dbUser.role !== ROLES.SUPER_ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { userId, role, plan } = body;

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  const updates: Partial<typeof users.$inferInsert> = {};
  if (role) updates.role = role;
  if (plan) updates.plan = plan;

  const [updatedUser] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning();

  return NextResponse.json({ user: updatedUser });
}

// Super admin setup is handled in auth.ts when users log in
