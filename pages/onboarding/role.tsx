

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setError('No authenticated user.');

    const { error: roleError } = await supabase.from('users').update({
      role: selectedRole
    }).eq('id', user.id);

    if (roleError) return setError(roleError.message);

    router.push('/onboarding/details');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Select Your Role</h2>
      <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} required>
        <option value="">Choose one</option>
        <option value="buyer">Buyer</option>
        <option value="seller">Seller</option>
        <option value="stylist">Stylist</option>
        <option value="driver">Driver</option>
      </select>
      <button type="submit">Continue</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}