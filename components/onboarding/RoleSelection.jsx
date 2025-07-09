// File: components/onboarding/RoleSelection.jsx

import { useEffect } from 'react'
import { useOnboarding } from '../../hooks/useOnboarding.js'
import { useSupabase } from '../../hooks/useSupabase.js'
import { useRouter } from 'next/router'
import { OnboardingLayout } from '../../layouts/OnboardingLayout.js'

export default function RoleSelection() {
  const { updateUserRole, loading, error, USER_ROLES } = useOnboarding()
  const { session, loading: authLoading } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login?redirect=/onboarding/role')
    }
  }, [session, authLoading, router])

  const handleRoleSelection = async (role) => {
    if (!session) {
      alert('Please log in to continue')
      router.push('/login?redirect=/onboarding/role')
      return
    }

    const updated = await updateUserRole(role)

    if (updated) {
      router.push('/onboarding/details')
    } else {
      console.error('Failed to update role:', error)
    }
  }

  if (authLoading) return <div>Loading...</div>
  if (!session) return <div>Please log in to continue</div>

  return (
    <OnboardingLayout step="role" totalSteps={4}>
      <div className="onboarding-step flex flex-col items-center justify-center min-h-screen text-white">
        <h2 className="text-2xl font-bold mb-4">Select your role</h2>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <button
            className="border-2 border-yellow-400 rounded-xl py-4 px-6 font-bold hover:bg-yellow-500 hover:text-black transition"
            onClick={() => handleRoleSelection(USER_ROLES.BUYER)}
            disabled={loading}
          >
            Buyer
          </button>

          <button
            className="border-2 border-yellow-400 rounded-xl py-4 px-6 font-bold hover:bg-yellow-500 hover:text-black transition"
            onClick={() => handleRoleSelection(USER_ROLES.SELLER_BRAND)}
            disabled={loading}
          >
            Seller / Brand
          </button>

          <button
            className="border-2 border-yellow-400 rounded-xl py-4 px-6 font-bold hover:bg-yellow-500 hover:text-black transition"
            onClick={() => handleRoleSelection(USER_ROLES.STYLIST)}
            disabled={loading}
          >
            Stylist
          </button>

          <button
            className="border-2 border-yellow-400 rounded-xl py-4 px-6 font-bold hover:bg-yellow-500 hover:text-black transition"
            onClick={() => handleRoleSelection(USER_ROLES.DRIVER)}
            disabled={loading}
          >
            Driver
          </button>
        </div>

        {loading && <p className="mt-4">Updating your profile...</p>}
        {error && <p className="mt-2 text-red-400">Error: {error}</p>}
      </div>
    </OnboardingLayout>
  )
}