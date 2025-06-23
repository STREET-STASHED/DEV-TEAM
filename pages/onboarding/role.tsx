import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/signup');
      }
    };

    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.push('/signup');
      return;
    }

    const user_id = user.id;

    const { error: roleError } = await supabase.from('users').update({
      role: selectedRole,
      details_complete: selectedRole === 'buyer',
      verified: false
    }).eq('uuid', user_id);

    if (roleError) return setError('Something went wrong. Please try again.');

    // Skip details if buyer
    if (selectedRole === 'buyer') {
      return router.push('/buyer/marketplace');
    }

    // After role selection, user is redirected to details step
    router.push('/onboarding/details');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-black rounded shadow space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-center text-white">Select Your Role</h2>
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        required
        className="w-full p-3 border border-gray-300 rounded text-white bg-black"
      >
        <option value="">Choose a role</option>
        <option value="buyer">Buyer (I’m just here to shop)</option>
        <option value="seller">Seller</option>
        <option value="stylist">Stylist</option>
        <option value="driver">Driver</option>
      </select>
      <button
        type="submit"
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded"
      >
        Continue
      </button>
      {error && <p className="text-red-500 text-sm text-center bg-black">{error}</p>}
    </form>
  );
}