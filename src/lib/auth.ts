import { cookies } from 'next/headers';
import { db } from './db';
import { users, ROLES } from './schema';
import { eq } from 'drizzle-orm';

// Super admin emails
const SUPER_ADMIN_EMAILS = [
  'joey@jdms.nl',
  'joe@jdms.nl',
];

export interface AuthUser {
  email: string;
  name: string;
  role?: string;
  plan?: string;
}

export async function getUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('__Secure-next-auth.session-token')?.value || 
                       cookieStore.get('next-auth.session-token')?.value;
  
  if (!sessionToken) {
    return null;
  }

  try {
    const response = await fetch('https://auth.jdms.nl/api/validate', {
      headers: {
        Cookie: `__Secure-next-auth.session-token=${sessionToken}`
      },
      cache: 'no-store'
    });

    const data = await response.json();
    
    if (data.valid && data.user) {
      const email = data.user.email;
      const name = data.user.name || email.split('@')[0];
      
      // Ensure user exists in database with correct role
      let dbUser = await db.query.users.findFirst({
        where: eq(users.email, email)
      });

      const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email.toLowerCase());

      if (!dbUser) {
        // Create user
        const [newUser] = await db.insert(users).values({
          email,
          name,
          role: isSuperAdmin ? ROLES.SUPER_ADMIN : ROLES.USER,
        }).returning();
        dbUser = newUser;
      } else if (isSuperAdmin && dbUser.role !== ROLES.SUPER_ADMIN) {
        // Upgrade to super admin if needed
        const [updatedUser] = await db
          .update(users)
          .set({ role: ROLES.SUPER_ADMIN })
          .where(eq(users.id, dbUser.id))
          .returning();
        dbUser = updatedUser;
      }

      return {
        email,
        name,
        role: dbUser.role,
        plan: dbUser.plan || 'free',
      };
    }
  } catch (error) {
    console.error('Auth validation error:', error);
  }

  return null;
}

export function getLoginUrl(callbackPath: string = '/') {
  const callbackUrl = encodeURIComponent(`https://rival.jdms.nl${callbackPath}`);
  return `https://auth.jdms.nl/login?callbackUrl=${callbackUrl}`;
}

export function isSuperAdmin(user: AuthUser | null): boolean {
  return user?.role === ROLES.SUPER_ADMIN;
}
