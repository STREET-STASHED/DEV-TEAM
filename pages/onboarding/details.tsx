import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';

export default function OnboardingDetails() {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from('users').select('role').eq('id', user.id).single();
        if (data?.role) setRole(data.role);
      }
      setLoading(false);
    };
    fetchRole();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Mark onboarding complete
    await supabase.from('users').update({ has_completed_onboarding: true }).eq('id', user.id);

    // Redirect based on role
    const redirectMap: Record<string, string> = {
      buyer: '/buyer/marketplace',
      seller: '/seller/dashboard',
      stylist: '/stylist/dashboard',
      driver: '/driver/dashboard',
    };
    router.push(redirectMap[role] || '/');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit}>
      {role === 'seller' && (
        <>
          <h2>Seller Onboarding</h2>
          <input placeholder="Store Name" required />
          <input placeholder="Description" required />
        </>
      )}
      {role === 'driver' && (
        <>
          <h2>Driver Onboarding</h2>
          <input placeholder="Vehicle Type" required />
          <input placeholder="Driver’s License Number" required />
        </>
      )}
      {role === 'stylist' && (
        <>
          <h2>Stylist Onboarding</h2>
          <input placeholder="Specialties" required />
          <input placeholder="Instagram / Portfolio" required />
        </>
      )}
      <button type="submit">Finish Onboarding</button>
    </form>
  );
}
