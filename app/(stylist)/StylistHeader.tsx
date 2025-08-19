'use client'

import Link from 'next/link'
import { useState } from 'react'
import { StreetStashedLogo } from '@/components/StreetStashedLogo'

export function StylistHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-ink-900 border-b border-ink-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <StreetStashedLogo href="/stylist" size="md" variant="gold" />
            <div className="ml-3 px-2 py-1 bg-brand-400/20 rounded text-brand-400 text-xs font-medium">
              STYLIST
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/stylist/dashboard"
              className="text-ink-300 hover:text-brand-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/stylist/looks"
              className="text-ink-300 hover:text-brand-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              My Looks
            </Link>
            <Link
              href="/stylist/bundle-upload"
              className="text-ink-300 hover:text-brand-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Bundle Upload
            </Link>
            <Link
              href="/stylist/curation"
              className="text-ink-300 hover:text-brand-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Curation Services
            </Link>
            <Link
              href="/stylist/appointments"
              className="text-ink-300 hover:text-brand-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Appointments
            </Link>
            <Link
              href="/stylist/clients"
              className="text-ink-300 hover:text-brand-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Clients
            </Link>
            <Link
              href="/stylist/earnings"
              className="text-ink-300 hover:text-brand-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Earnings
            </Link>
          </nav>

          {/* Profile Dropdown */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-ink-300 hover:text-brand-400 p-2 rounded-md transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h5L9 2 4 7h5v5z" />
              </svg>
            </button>
            <div className="w-8 h-8 bg-brand-400 rounded-full flex items-center justify-center">
              <span className="text-ink-black text-sm font-medium">SM</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-ink-300 hover:text-brand-400 p-2 rounded-md transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-ink-800">
              <Link
                href="/stylist/dashboard"
                className="text-ink-300 hover:text-brand-400 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/stylist/looks"
                className="text-ink-300 hover:text-brand-400 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                My Looks
              </Link>
              <Link
                href="/stylist/bundle-upload"
                className="text-ink-300 hover:text-brand-400 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Bundle Upload
              </Link>
              <Link
                href="/stylist/curation"
                className="text-ink-300 hover:text-brand-400 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Curation Services
              </Link>
              <Link
                href="/stylist/appointments"
                className="text-ink-300 hover:text-brand-400 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Appointments
              </Link>
              <Link
                href="/stylist/clients"
                className="text-ink-300 hover:text-brand-400 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Clients
              </Link>
              <Link
                href="/stylist/earnings"
                className="text-ink-300 hover:text-brand-400 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Earnings
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
