'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center max-w-md mx-auto px-4">
        {/* 404 Icon */}
        <div className="mx-auto h-24 w-24 text-ink-400 mb-6">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-ink-200 mb-4">Page Not Found</h2>
        <p className="text-ink-400 mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/"
            className="w-full inline-flex justify-center items-center px-6 py-3 text-base font-medium rounded-xl text-black bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200"
          >
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-ink-600 text-base font-medium rounded-xl text-ink-300 bg-ink-900 hover:bg-ink-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
