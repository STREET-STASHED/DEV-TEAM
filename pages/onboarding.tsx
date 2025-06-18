import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';

const roles = ['buyer', 'seller', 'stylist', 'driver'];

const OnboardingPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRole() {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user) {
        router.push('/login');
        return;
      }

      const uid = data.session.user.id;
      setUserId(uid);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', uid)
        .single();

      if (userError) {
        console.error('Error fetching user role:', userError);
      }

      if (userData?.role) {
        router.push(getRedirectPath(userData.role));
      } else {
        setLoading(false);
      }
    }

    fetchRole();
  }, [router]);

  function getRedirectPath(role: string) {
    const map: { [key: string]: string } = {
      buyer: '/buyer/marketplace',
      seller: '/seller/dashboard',
      stylist: '/stylist/dashboard',
      driver: '/driver/dashboard',
    };
    return map[role] || '/';
  }

  async function updateRole() {
    setError('');
    if (!selectedRole) {
      setError('Please select a role.');
      return;
    }
    if (!userId) {
      setError('User not authenticated.');
      return;
    }
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const email = sessionData?.session?.user?.email;
    const { error } = await supabase
      .from('users')
      .upsert({ id: userId, email: email ?? '', role: selectedRole }, { onConflict: 'id' });

    if (error) {
      setError('Failed to update role. Try again.');
      setLoading(false);
      return;
    }
    router.push(getRedirectPath(selectedRole));
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-yellow-400 font-graffiti bg-black bg-cover bg-center"
        style={{ backgroundImage: "url('/background.png')" }}
      >
        <p className="text-xl">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-yellow-400 font-graffiti">
      <h1 className="text-3xl mb-6">Select Your Role</h1>
      {error && <p className="mb-4 text-red-500">{error}</p>}
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        className="mb-6 p-2 text-black rounded w-64"
      >
        <option value="">-- Choose a role --</option>
        {roles.map((r) => (
          <option key={r} value={r}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </option>
        ))}
      </select>
      <button
        onClick={updateRole}
        className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded"
      >
        Continue
      </button>
    </div>
  );
};

export default OnboardingPage;