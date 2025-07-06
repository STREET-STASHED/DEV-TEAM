import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bypass middleware for Next.js internals, static assets, and service worker
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
    return NextResponse.next();
  }

  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options })
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  const PUBLIC_PATHS = [
    '/',
    '/welcome',
    '/Auth',
    '/login',
    '/marketplace',
    '/stores',
    '/stylists',
    '/track',
    '/onboarding/details',
    '/onboarding/role',
    '/onboarding/verify',
  ]

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(path + '/')
  )

  if (!user && !isPublicPath) {
    const currentPath = req.nextUrl.pathname + req.nextUrl.search
    const targetPath = `/login?redirectedFrom=${req.nextUrl.pathname}`

    if (currentPath !== targetPath) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|public/).*)',
  ],
}