import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (pathname === '/login') {
    const url = req.nextUrl.clone();
    const supabaseSession = req.cookies.get('sb-access-token')?.value;

    if (supabaseSession) {
      const role = req.cookies.get('user-role')?.value;

      if (role === 'buyer') {
        url.pathname = '/buyer';
      } else if (role === 'seller') {
        url.pathname = '/seller/dashboard';
      } else if (role === 'stylist') {
        url.pathname = '/stylist/dashboard';
      } else if (role === 'driver') {
        url.pathname = '/driver';
      } else if (role === 'admin') {
        url.pathname = '/admin/dashboard';
      } else {
        url.pathname = '/dashboard'; // fallback if role is missing or unrecognized
      }

      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/onboarding') && pathname !== '/onboarding/role') {
    const role = req.cookies.get('user-role')?.value;
    if (!role) {
      const url = req.nextUrl.clone();
      url.pathname = '/onboarding/role';
      return NextResponse.redirect(url);
    }
  }

  if (pathname === '/onboarding' || pathname === '/onboarding/') {
    const url = req.nextUrl.clone();
    url.pathname = '/onboarding/role';
    return NextResponse.redirect(url);
  }

  if (session?.user) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, verified')
      .eq('id', session.user.id)
      .single();

    if (
      (pathname.startsWith('/buyer') && userProfile?.role !== 'buyer') ||
      (pathname.startsWith('/seller') && userProfile?.role !== 'seller') ||
      (pathname.startsWith('/stylist') && userProfile?.role !== 'stylist') ||
      (pathname.startsWith('/driver') && userProfile?.role !== 'driver') ||
      (pathname.startsWith('/admin') && userProfile?.role !== 'admin')
    ) {
      const url = req.nextUrl.clone();
      url.pathname = '/onboarding/role';
      return NextResponse.redirect(url);
    }

    if (!userProfile?.verified && (
      pathname.startsWith('/buyer') ||
      pathname.startsWith('/seller') ||
      pathname.startsWith('/stylist') ||
      pathname.startsWith('/driver') ||
      pathname.startsWith('/admin')
    )) {
      const url = req.nextUrl.clone();
      url.pathname = '/onboarding/verify';
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/signup',
    '/onboarding/:path*',
    '/buyer/:path*',
    '/seller/:path*',
    '/stylist/:path*',
    '/driver/:path*',
    '/admin/:path*',
  ],
};
