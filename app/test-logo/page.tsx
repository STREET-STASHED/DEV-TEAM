'use client'

import { StreetStashedLogo } from '@/components/StreetStashedLogo'

export default function TestLogoPage() {
  return (
    <div className="min-h-screen bg-ink-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">🎨 Logo Test Page</h1>
        
        <div className="space-y-12">
          {/* Small Logo */}
          <div className="bg-ink-900 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Small Logo</h2>
            <StreetStashedLogo size="sm" variant="light" />
          </div>
          
          {/* Medium Logo */}
          <div className="bg-ink-900 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Medium Logo (Default)</h2>
            <StreetStashedLogo size="md" variant="light" />
          </div>
          
          {/* Large Logo */}
          <div className="bg-ink-900 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Large Logo</h2>
            <StreetStashedLogo size="lg" variant="light" />
          </div>
          
          {/* Logo without text */}
          <div className="bg-ink-900 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Logo Only (No Text)</h2>
            <StreetStashedLogo size="lg" variant="light" showText={false} />
          </div>
          
          {/* Different variants */}
          <div className="bg-ink-900 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Different Variants</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg mb-2">Light Variant</h3>
                <StreetStashedLogo size="md" variant="light" />
              </div>
              <div>
                <h3 className="text-lg mb-2">Dark Variant</h3>
                <StreetStashedLogo size="md" variant="dark" />
              </div>
              <div>
                <h3 className="text-lg mb-2">Gold Variant</h3>
                <StreetStashedLogo size="md" variant="gold" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <a href="/" className="text-brand-400 hover:text-brand-300 underline">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
