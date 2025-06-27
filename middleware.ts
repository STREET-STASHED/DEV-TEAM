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
        get: (key: string) => req.cookies.get(key)?.value,
        set: (key: string, value: string, options: any) => {
          res.cookies.set(key, value, options);
        },
        remove: (key: string, options: any) => {
          res.cookies.set(key, '', { ...options, maxAge: -1 });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Redirect users with a valid session from "/" to appropriate dashboard based on role
  if (session && pathname === '/') {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const role = user?.user_metadata?.role;

    if (role === 'buyer') {
      return NextResponse.redirect(new URL('/buyer/dashboard', req.url));
    } else if (role === 'seller') {
      return NextResponse.redirect(new URL('/seller/dashboard', req.url));
    } else if (role === 'stylist') {
      return NextResponse.redirect(new URL('/stylist/dashboard', req.url));
    } else if (role === 'driver') {
      return NextResponse.redirect(new URL('/driver/dashboard', req.url));
    } else if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    } else {
      return NextResponse.redirect(new URL('/onboarding/role', req.url));
    }
  }

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