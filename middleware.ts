import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const token = request.cookies.get('sb-access-token')?.value;

  const pathname = url.pathname;

  const protectedPaths = ['/dashboard', '/onboarding', '/buyer', '/seller', '/driver', '/stylist'];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!token && isProtected) {
    url.pathname = '/signup';
    return NextResponse.redirect(url);
  }

  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, details_complete, verification_complete')
      .eq('id', session.user.id)
      .single();

    const needsRole = !userProfile?.role;
    const needsDetails = userProfile?.role && !userProfile?.details_complete;
    const needsVerify = userProfile?.role && userProfile?.details_complete && !userProfile?.verification_complete;

    const onboardingIncomplete = needsRole || needsDetails || needsVerify;

    if (pathname.startsWith('/onboarding') && onboardingIncomplete) {
      if (needsRole) {
        url.pathname = '/onboarding/role';
        return NextResponse.redirect(url);
      }

      if (needsDetails) {
        url.pathname = '/onboarding/details';
        return NextResponse.redirect(url);
      }

      if (needsVerify) {
        url.pathname = '/onboarding/verify';
        return NextResponse.redirect(url);
      }
    }

    if (pathname === '/signup') {
      url.pathname = '/onboarding/role';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/buyer/:path*',
    '/seller/:path*',
    '/driver/:path*',
    '/stylist/:path*',
    '/signup',
  ],
};