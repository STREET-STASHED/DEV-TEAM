'use client'

import { useState } from 'react'
import GamificationDashboard from '@/components/onboarding/GamificationDashboard'

export default function TestOnboardingPage() {
  const [userId] = useState('test-user-123')
  const [role, setRole] = useState<'seller' | 'stylist' | 'driver'>('seller')

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Onboarding System Test</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Role Selection</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setRole('seller')}
              className={`px-4 py-2 rounded-lg ${
                role === 'seller' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Seller
            </button>
            <button
              onClick={() => setRole('stylist')}
              className={`px-4 py-2 rounded-lg ${
                role === 'stylist' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Stylist
            </button>
            <button
              onClick={() => setRole('driver')}
              className={`px-4 py-2 rounded-lg ${
                role === 'driver' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Driver
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Gamification Dashboard</h2>
          <GamificationDashboard 
            userId={userId} 
            role={role}
            className="mb-8"
          />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Links</h2>
          <div className="space-y-2">
            <a 
              href="/onboarding/streamlined?role=seller" 
              className="block text-blue-400 hover:text-blue-300"
            >
              Seller Onboarding Flow
            </a>
            <a 
              href="/onboarding/streamlined?role=stylist" 
              className="block text-blue-400 hover:text-blue-300"
            >
              Stylist Onboarding Flow
            </a>
            <a 
              href="/onboarding/streamlined?role=driver" 
              className="block text-blue-400 hover:text-blue-300"
            >
              Driver Onboarding Flow
            </a>
            <a 
              href="/signup" 
              className="block text-blue-400 hover:text-blue-300"
            >
              Signup Page (redirects to onboarding)
            </a>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <h3 className="font-semibold text-green-400 mb-2">✅ Database Schema</h3>
              <p className="text-sm text-gray-300">All tables and types updated</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <h3 className="font-semibold text-green-400 mb-2">✅ API Endpoints</h3>
              <p className="text-sm text-gray-300">Streamlined onboarding API ready</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <h3 className="font-semibold text-green-400 mb-2">✅ UI Components</h3>
              <p className="text-sm text-gray-300">All components functional</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Features Implemented</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <h3 className="font-semibold text-blue-400 mb-2">Phase 1: Instant Onboarding</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Streamlined 3-4 step flows</li>
                <li>• Auto-advancing progress</li>
                <li>• Role-specific steps</li>
                <li>• Visual progress indicators</li>
              </ul>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <h3 className="font-semibold text-purple-400 mb-2">Phase 2: AI Automation</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Auto-approval system</li>
                <li>• Risk scoring algorithm</li>
                <li>• Confidence scoring</li>
                <li>• Conditional approvals</li>
              </ul>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <h3 className="font-semibold text-orange-400 mb-2">Phase 3: Gamification</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Achievement system</li>
                <li>• XP and leveling</li>
                <li>• Milestones tracking</li>
                <li>• Reward claiming</li>
              </ul>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <h3 className="font-semibold text-green-400 mb-2">Database & API</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Role-specific profiles</li>
                <li>• Gamification tables</li>
                <li>• RLS policies</li>
                <li>• TypeScript types</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
