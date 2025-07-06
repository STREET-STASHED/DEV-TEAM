'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedLayout from '../../components/ProtectedLayout';
import { createBrowserClient } from '@supabase/ssr';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function RoleSelection() {
  const router = useRouter();
  const { profile, updateProfile, completeOnboarding, loading } = useOnboarding();
  const [selectedRole, setSelectedRole] = useState(profile?.role || 'brand');
  const [submitting, setSubmitting] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (profile?.onboarding_step && profile.onboarding_step !== 'role') {
      router.push(`/onboarding/${profile.onboarding_step}`);
    }
  }, [profile]);

  const roles = [
    { id: 'brand', label: 'Brand', description: 'I represent a brand looking to promote products' },
    { id: 'influencer', label: 'Influencer', description: 'I create content and have an audience' },
    { id: 'agency', label: 'Agency', description: 'I represent multiple brands or influencers' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await updateProfile({
        role: selectedRole,
        onboarding_step: 'details'
      });

      if (error) throw error;

      router.push('/onboarding/details');
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update role. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedLayout supabaseClient={supabase}>
      <div className="min-h-screen flex items-center justify-center bg-black px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl bg-gray-900 text-white p-8 rounded-lg shadow-lg space-y-6"
        >
          <h1 className="text-2xl font-bold text-center mb-4">Select Your Role</h1>
          <p className="text-center text-sm text-gray-400 mb-6">
            Tell us how you'll be using our platform
          </p>

          <div className="grid gap-4">
            {roles.map(role => (
              <label
                key={role.id}
                className={`block p-4 rounded-lg border cursor-pointer transition ${
                  selectedRole === role.id
                    ? 'bg-yellow-500 text-black border-yellow-600'
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="radio"
                    name="role"
                    value={role.id}
                    checked={selectedRole === role.id}
                    onChange={() => setSelectedRole(role.id)}
                    className="form-radio text-yellow-500"
                  />
                  <div>
                    <p className="font-semibold">{role.label}</p>
                    <p className="text-sm text-gray-300">{role.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting || !selectedRole}
              className={`w-full py-3 rounded-lg font-semibold ${
                submitting
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-black'
              }`}
            >
              {submitting ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </ProtectedLayout>
  );
}
