import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use mock user_id for onboarding; replace with real logic later
    const user_id = router.query.user_id || 'test-user-id';

    const { error: roleError } = await supabase.from('users').update({
      role: selectedRole,
      details_complete: false,
      verified: false
    }).eq('id', user_id);

    if (roleError) return setError('Something went wrong. Please try again.');

    router.push('/onboarding/details');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-center">Select Your Role</h2>
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        required
        className="w-full p-3 border border-gray-300 rounded"
      >
        <option value="">Choose a role</option>
        <option value="buyer">Buyer</option>
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
      {error && <p className="text-red-600 text-sm text-center">{error}</p>}
    </form>
  );
}