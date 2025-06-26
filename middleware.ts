import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => {
          return req.cookies.get(key)?.value;
        },
        set: (key, value, options) => {
          res.cookies.set(key, value, options);
        },
        remove: (key, options) => {
          res.cookies.set(key, '', { ...options, maxAge: -1 });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  const isAuthRoute = pathname.startsWith('/onboarding') ||
                      pathname.startsWith('/buyer') ||
                      pathname.startsWith('/seller') ||
                      pathname.startsWith('/stylist') ||
                      pathname.startsWith('/driver') ||
                      pathname.startsWith('/admin');

  if (!session && isAuthRoute) {
    const loginUrl = new URL('/signup', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: [
    '/',
    '/signup',
    '/onboarding/:path*',
    '/buyer/:path*',
    '/seller/:path*',
    '/stylist/:path*',
    '/driver/:path*',
    '/admin/:path*',
  ],
};