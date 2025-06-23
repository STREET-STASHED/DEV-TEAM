import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = req.nextUrl.pathname;

  // Allow access to public routes
  if (!session) {
    if (
      pathname.startsWith('/login') ||
      pathname.startsWith('/signup') ||
      (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) ||
      pathname.startsWith('/_next') ||
      pathname === '/' ||
      pathname.includes('.')
    ) {
      return res;
    }

    // Redirect unauthenticated users trying to access protected routes
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const { data: userInfo } = await supabase
    .from('users')
    .select('role, details_complete')
    .eq('id', session.user.id)
    .single();

  // If no role, redirect to onboarding role step
  if (!userInfo?.role && !pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/onboarding/role', req.url));
  }

  // If role exists but onboarding not complete, redirect to details step
  if (userInfo?.role && !userInfo.details_complete && !pathname.startsWith('/onboarding/details')) {
    return NextResponse.redirect(new URL('/onboarding/details', req.url));
  }

  // If buyer is trying to visit non-buyer pages, redirect to buyer marketplace
  if (userInfo?.role === 'buyer' && !pathname.startsWith('/buyer') && !pathname.startsWith('/api/auth')) {
    return NextResponse.redirect(new URL('/buyer/marketplace', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|api/auth|public).*)',
  ],
};