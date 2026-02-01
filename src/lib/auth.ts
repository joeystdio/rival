import { cookies } from 'next/headers';

export interface AuthUser {
  email: string;
  name: string;
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
      return {
        email: data.user.email,
        name: data.user.name || data.user.email.split('@')[0]
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
