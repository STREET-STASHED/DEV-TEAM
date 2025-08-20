'use client'

import { SignupForm } from './SignupForm'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SignupPageContent() {
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get('redirectedFrom')

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-black to-ink-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Join StreetStashed</h1>
          {redirectedFrom === '/buyer/checkout' ? (
            <div className="space-y-2">
              <p className="text-brand-400 font-medium">🎉 Special Offer!</p>
              <p className="text-ink-300">Create an account and save 10% on your order</p>
              <p className="text-ink-400 text-sm">Plus get order tracking and exclusive member benefits</p>
            </div>
          ) : (
            <p className="text-ink-300">Choose your role and start your fashion journey</p>
          )}
        </div>

        <SignupForm />

        <div className="text-center mt-6">
          <p className="text-sm text-ink-400">
            Already have an account?{' '}
            <a href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-ink-black to-ink-900 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-400 mx-auto mb-4"></div>
          <p className="text-ink-300">Loading...</p>
        </div>
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  )
}
