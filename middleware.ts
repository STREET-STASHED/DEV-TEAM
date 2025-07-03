import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove: (name, options) => {
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const PUBLIC_PATHS = [
    '/',
    '/welcome',
    '/marketplace',
    '/stores',
    '/stylists',
    '/track',
    '/login',
    '/signup',
  ]

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(path + '/')
  )

  if (session && !isPublicPath) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('details_complete, has_completed_onboarding, onboarded')
      .eq('id', session.user.id)
      .single()

    const isOnboardingIncomplete = !profileData?.details_complete || !profileData?.has_completed_onboarding || !profileData?.onboarded

    if (isOnboardingIncomplete && !req.nextUrl.pathname.startsWith('/onboarding')) {
      const onboardingUrl = req.nextUrl.clone()
      onboardingUrl.pathname = '/onboarding'
      return NextResponse.redirect(onboardingUrl)
    }
  }

  if (!session && !isPublicPath) {
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
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}