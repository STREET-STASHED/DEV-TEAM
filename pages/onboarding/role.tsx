import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
    if (!selectedRole || loading) return;

    setLoading(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.push('/signup');
      setLoading(false);
      return;
    }

    const user_id = user.id || user.user_metadata?.sub;

    const { error: roleError } = await supabase
      .from('users')
      .update({
        role: selectedRole,
        details_complete: selectedRole === 'buyer',
        verified: false
      })
      .eq('id', user_id);

    if (roleError) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    if (selectedRole === 'buyer') {
      router.push('/onboarding/verify');
    } else {
      router.push('/onboarding/details');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-8 bg-black/70 backdrop-blur-md rounded-xl shadow-2xl space-y-6 border border-yellow-400 text-white">
      <h2 className="text-3xl font-bold text-center text-yellow-400">Select Your Role</h2>
      
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        required
        aria-label="Select your role"
        className="w-full p-3 rounded-lg border border-gray-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        <option value="">Choose a role</option>
        <option value="buyer">Buyer (I’m just here to shop)</option>
        <option value="seller">Seller</option>
        <option value="stylist">Stylist</option>
        <option value="driver">Driver</option>
      </select>

      <button
        type="submit"
        disabled={!selectedRole || loading}
        aria-label="Continue to role onboarding"
        className={`w-full font-semibold py-2 px-4 rounded transition-all ${
          selectedRole && !loading
            ? 'bg-yellow-400 hover:bg-yellow-500 text-black'
            : 'bg-gray-400 text-gray-700 cursor-not-allowed'
        }`}
      >
        {loading ? 'Loading...' : 'Continue'}
      </button>

      {success && <p className="text-green-400 text-center">Redirecting...</p>}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </form>
  );
}