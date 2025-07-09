// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Skip internals/static
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.css')
  ) {
    return NextResponse.next()
  }

  // Only check for the Supabase auth cookie
  const hasAccessToken = req.cookies.has('sb-access-token')

  // Publicly accessible routes
  const PUBLIC_PATHS = [
    '/',
    '/welcome',
    '/auth',         // updated
    '/marketplace',
    '/stores',
    '/stylists',
    '/track',
    '/onboarding/details',
    '/onboarding/role',
    '/onboarding/verify',
  ]

  const isPublic = PUBLIC_PATHS.some(
    (path) =>
      pathname === path || pathname.startsWith(path + '/')
  )

  if (!hasAccessToken && !isPublic) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth'        // updated
    redirectUrl.searchParams.set(
      'redirectedFrom',
      pathname + search
    )
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|public/).*)',
  ],
}