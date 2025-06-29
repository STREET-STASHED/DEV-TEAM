import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { getUserRole } from '@/lib/getUserRole';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import useOnboardingRedirect from '@/hooks/useOnboardingRedirect';

export default function RolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>(''); // default is still '', but no required message flashes until interaction
  const [loading, setLoading] = useState(false);
  const [initError, setInitError] = React.useState<string | null>(null);

  const supabase = createClientComponentClient();
  const { redirectUserBasedOnProfile } = useOnboardingRedirect();

  React.useEffect(() => {
    redirectUserBasedOnProfile();
  }, []);

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600 font-semibold">{initError}</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!selectedRole) {
      alert('Please select a role to continue.');
      setLoading(false);
      return;
    }
    const supabase = createClientComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('User session missing. Please log in again.');
      setLoading(false);
      return;
    }
    console.log("Saving role to Supabase for user:", user.id, "Role:", selectedRole);
    const cleanRole = selectedRole.trim().toLowerCase();
    // Update role on users table
    const { error: upsertError } = await supabase
      .from('users')
      .update({ role: cleanRole, onboarded: false })
      .eq('id', user.id);
    if (upsertError) {
      console.error('Role upsert error:', upsertError);
      alert('Unable to save role. Try again.');
      setLoading(false);
      return;
    }
    console.log("Selected Role:", selectedRole);
    // Redirect based on role
    router.push('/onboarding/details');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md space-y-6 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center text-black">Select Your Role</h1>
        {['buyer', 'seller', 'driver', 'stylist'].map((role) => (
          <label htmlFor={role} key={role} className="flex items-center space-x-3 cursor-pointer">
            <input
              id={role}
              type="radio"
              name="role"
              value={role}
              checked={selectedRole === role}
              onChange={() => setSelectedRole(role.trim().toLowerCase())}
              className="form-radio text-blue-600"
              required
            />
            <span className="capitalize text-black">{role}</span>
          </label>
        ))}
        {!selectedRole && (
          <p className="text-sm text-red-600">Please select a role to continue.</p>
        )}
        <button
          type="submit"
          disabled={!selectedRole || loading}
          className={`w-full ${loading ? 'bg-gray-400' : 'bg-blue-600'} text-white p-3 rounded-md`}
        >
          {loading ? 'Submitting...' : 'Continue to Details'}
        </button>
      </form>
    </div>
  );
}
