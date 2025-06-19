import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';

const OnboardingPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<any>({
    // Seller fields
    store_name: '',
    store_description: '',
    payout_method: '',
    // Stylist fields
    specialty: '',
    bio: '',
    instagram: '',
    booking_link: '',
    // Driver fields
    vehicle_type: '',
    license_number: '',
    delivery_radius: '',
  });

  useEffect(() => {
    async function fetchUserAndResume() {
      const { data, error } = await supabase.auth.getSession();
      if (data.session?.user) {
        const uid = data.session.user.id;
        setUserId(uid);

        // Get user role
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', uid)
          .single();

        if (!userError && userData?.role && userData.role !== '') {
          // Already has a role—redirect straight to dashboard
          const dash = getRedirectPath(userData.role);
          router.replace(dash);
          return;
        }

        // Check for onboarding draft in localStorage to resume onboarding
        if (typeof window !== 'undefined') {
          const draftStr = localStorage.getItem('onboardingDraft');
          if (draftStr) {
            try {
              const draft = JSON.parse(draftStr);
              if (draft.role && draft.formData) {
                setRole(draft.role);
                setFormData(draft.formData);
                // Immediately submit onboarding with draft data
                await submitOnboardingDraft(uid, draft.role, draft.formData);
                localStorage.removeItem('onboardingDraft');
                return;
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
      setLoading(false);
    }
    fetchUserAndResume();
    // eslint-disable-next-line
  }, []);

  function getRedirectPath(role: string) {
    switch (role) {
      case 'buyer':
        return '/buyer/marketplace';
      case 'seller':
        return '/seller/dashboard';
      case 'stylist':
        return '/stylist/dashboard';
      case 'driver':
        return '/driver/dashboard';
      default:
        return '/';
    }
  }

  // User picks role on this page if not set yet
  const [selectedRole, setSelectedRole] = useState('');
  const handleRoleSelect = async () => {
    setError('');
    if (!selectedRole) {
      setError('Select a role to continue.');
      return;
    }
    if (selectedRole === 'buyer') {
      // For buyers: if logged in, update role and redirect; if not, redirect to login and set role after login
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData?.session?.user?.email;
      const uid = sessionData?.session?.user?.id;
      if (!uid) {
        // Not logged in: store buyer intent and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.setItem('onboardingDraft', JSON.stringify({ role: 'buyer', formData: {} }));
        }
        router.replace('/login');
        return;
      }
      // Logged in: upsert buyer role and redirect
      const { error: upsertErr } = await supabase
        .from('users')
        .upsert({ id: uid, email: email ?? '', role: 'buyer' }, { onConflict: 'id' });
      if (upsertErr) {
        setError('Failed to update role.');
        return;
      }
      router.replace(getRedirectPath('buyer'));
    } else {
      setRole(selectedRole);
    }
  };

  // Helper to submit onboarding draft after login or immediately
  const submitOnboardingDraft = async (uid: string, role: string, data: any) => {
    setError('');
    const { data: sessionData } = await supabase.auth.getSession();
    const email = sessionData?.session?.user?.email;

    if (role === 'seller') {
      const { store_name, store_description, payout_method } = data;
      if (!store_name || !store_description || !payout_method) {
        setError('All fields required.');
        setLoading(false);
        return;
      }
      const { error: insertError } = await supabase.from('sellers').upsert([{
        user_id: uid,
        store_name,
        store_description,
        payout_method,
        logo_url: '',
        subscription_tier: 'free',
        created_at: new Date().toISOString(),
      }], { onConflict: 'user_id' });
      if (insertError) {
        setError('Failed to save seller info.');
        setLoading(false);
        return;
      }
      await supabase.from('users').upsert({ id: uid, email: email ?? '', role }, { onConflict: 'id' });
      router.replace(getRedirectPath(role));
    } else if (role === 'stylist') {
      const { specialty, bio, instagram, booking_link } = data;
      if (!specialty || !bio || !instagram || !booking_link) {
        setError('All fields required.');
        setLoading(false);
        return;
      }
      const { error: insertError } = await supabase.from('stylists').upsert([{
        user_id: uid,
        specialty,
        bio,
        instagram,
        booking_link,
        created_at: new Date().toISOString(),
      }], { onConflict: 'user_id' });
      if (insertError) {
        setError('Failed to save stylist info.');
        setLoading(false);
        return;
      }
      await supabase.from('users').upsert({ id: uid, email: email ?? '', role }, { onConflict: 'id' });
      router.replace(getRedirectPath(role));
    } else if (role === 'driver') {
      const { vehicle_type, license_number, delivery_radius } = data;
      if (!vehicle_type || !license_number || !delivery_radius) {
        setError('All fields required.');
        setLoading(false);
        return;
      }
      const { error: insertError } = await supabase.from('drivers').upsert([{
        user_id: uid,
        vehicle_type,
        license_number,
        delivery_radius,
        is_online: false,
        created_at: new Date().toISOString(),
      }], { onConflict: 'user_id' });
      if (insertError) {
        setError('Failed to save driver info.');
        setLoading(false);
        return;
      }
      await supabase.from('users').upsert({ id: uid, email: email ?? '', role }, { onConflict: 'id' });
      router.replace(getRedirectPath(role));
    }
  };

  // Onboarding submit handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData?.session?.user?.id;
    if (!role) {
      setError('Select a role first.');
      return;
    }
    if (!uid) {
      // Not logged in: save draft and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboardingDraft', JSON.stringify({ role, formData }));
      }
      router.replace('/login');
      return;
    }
    await submitOnboardingDraft(uid, role, formData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-yellow-400 font-graffiti bg-black">
        <p className="text-xl">Loading your dashboard...</p>
      </div>
    );
  }

  // Step 1: Show role selection if no role yet
  if (!role) {
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
          <option value="seller">Seller</option>
          <option value="stylist">Stylist</option>
          <option value="driver">Driver</option>
          <option value="buyer">Buyer</option>
        </select>
        <button
          onClick={handleRoleSelect}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded"
        >
          Continue
        </button>
      </div>
    );
  }

  // Step 2: Onboarding form for seller, stylist, driver
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-yellow-400 font-graffiti px-4">
      <h1 className="text-3xl mb-6 capitalize">{role} Onboarding</h1>
      {error && <p className="mb-4 text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        {role === 'seller' && (
          <>
            <label className="block mb-2">
              Store Name
              <input
                type="text"
                required
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                className="w-full p-2 mb-4 text-black rounded"
              />
            </label>
            <label className="block mb-2">
              Store Description
              <textarea
                required
                value={formData.store_description}
                onChange={(e) => setFormData({ ...formData, store_description: e.target.value })}
                className="w-full p-2 mb-4 text-black rounded"
                rows={4}
              />
            </label>
            <label className="block mb-6">
              Payout Method
              <input
                type="text"
                required
                value={formData.payout_method}
                onChange={(e) => setFormData({ ...formData, payout_method: e.target.value })}
                className="w-full p-2 text-black rounded"
              />
            </label>
          </>
        )}
        {role === 'stylist' && (
          <>
            <label className="block mb-2">
              Specialty
              <input
                type="text"
                required
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full p-2 mb-4 text-black rounded"
              />
            </label>
            <label className="block mb-2">
              Bio
              <textarea
                required
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full p-2 mb-4 text-black rounded"
                rows={4}
              />
            </label>
            <label className="block mb-2">
              Instagram
              <input
                type="text"
                required
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full p-2 mb-4 text-black rounded"
              />
            </label>
            <label className="block mb-6">
              Booking Link
              <input
                type="url"
                required
                value={formData.booking_link}
                onChange={(e) => setFormData({ ...formData, booking_link: e.target.value })}
                className="w-full p-2 text-black rounded"
              />
            </label>
          </>
        )}
        {role === 'driver' && (
          <>
            <label className="block mb-2">
              Vehicle Type
              <input
                type="text"
                required
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                className="w-full p-2 mb-4 text-black rounded"
              />
            </label>
            <label className="block mb-2">
              License Number
              <input
                type="text"
                required
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                className="w-full p-2 mb-4 text-black rounded"
              />
            </label>
            <label className="block mb-6">
              Delivery Radius (miles)
              <input
                type="number"
                min={0}
                required
                value={formData.delivery_radius}
                onChange={(e) => setFormData({ ...formData, delivery_radius: e.target.value })}
                className="w-full p-2 text-black rounded"
              />
            </label>
          </>
        )}
        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded w-full"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default OnboardingPage;