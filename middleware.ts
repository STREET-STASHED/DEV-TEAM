import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;

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

    if (onboardingIncomplete) {
      if (needsRole && pathname !== '/onboarding/role') {
        url.pathname = '/onboarding/role';
        return NextResponse.redirect(url);
      }

      if (needsDetails && pathname !== '/onboarding/details') {
        url.pathname = '/onboarding/details';
        return NextResponse.redirect(url);
      }

      if (needsVerify && pathname !== '/onboarding/verify') {
        url.pathname = '/onboarding/verify';
        return NextResponse.redirect(url);
      }

      // Already on the correct onboarding step — do nothing and proceed
    } else {
      // Fully onboarded user
      if (pathname.startsWith('/onboarding') || pathname === '/signup') {
        const role = userProfile?.role;
        if (role === 'buyer') url.pathname = '/buyer';
        else if (role === 'seller') url.pathname = '/seller';
        else if (role === 'driver') url.pathname = '/driver';
        else if (role === 'stylist') url.pathname = '/stylist';
        else url.pathname = '/dashboard';

        return NextResponse.redirect(url);
      }
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