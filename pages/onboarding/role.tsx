import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getUserRole } from '@/lib/getUserRole';
import supabase from '@/lib/supabaseClient';

export default function RolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        router.push('/login');
        return;
      }

      const { data, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (roleError) {
        console.error('Role fetch error:', roleError);
        return;
      }

      if (data?.role) {
        router.replace('/onboarding/details');
      }
    };

    checkRoleAndRedirect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const {
      data: { session: supaSession },
      error: sessionError,
    } = await supabase.auth.getSession();
    const user = supaSession?.user;
    if (!user) {
      alert('Please log in to continue');
      setLoading(false);
      return;
    }
    // Update role on users table
    const { error: upsertError } = await supabase
      .from('users')
      .update({ role: selectedRole, onboarded: true })
      .eq('id', user.id);
    if (upsertError) {
      console.error('Role upsert error:', upsertError);
      alert('Unable to save role. Try again.');
      setLoading(false);
      return;
    }
    // Redirect based on role
    await router.push('/onboarding/details');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md space-y-6 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center text-black">Select Your Role</h1>
        {['buyer', 'seller', 'driver', 'stylist'].map((role) => (
          <label htmlFor={role} key={role} className="flex items-center space-x-3">
            <input
              id={role}
              type="radio"
              name="role"
              value={role}
              checked={selectedRole === role}
              onChange={() => setSelectedRole(role)}
              className="form-radio text-blue-600"
              required
            />
            <span className="capitalize text-black">{role}</span>
          </label>
        ))}
        <button
          type="submit"
          disabled={!selectedRole || loading}
          className="w-full bg-blue-600 text-white p-3 rounded-md"
        >
          {loading ? 'Submitting...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
