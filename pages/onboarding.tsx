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
    async function fetchUserAndRedirect() {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const uid = data.session.user.id;
        setUserId(uid);

        // Get user role
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', uid)
          .single();

        if (
          !userError &&
          userData?.role &&
          userData.role !== '' &&
          userData.role !== 'buyer'
        ) {
          // If user has a non-buyer role, redirect to their dashboard
          const dash = getRedirectPath(userData.role);
          router.replace(dash);
          return;
        }
        // If buyer or no role, stay on onboarding
      }
      setLoading(false);
    }
    fetchUserAndRedirect();
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
      // For buyers: if logged in, update role and redirect; if not, redirect to login
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData?.session?.user?.email;
      const uid = sessionData?.session?.user?.id;
      if (!uid) {
        // Not logged in: redirect to login
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

  // Onboarding submit logic for seller, stylist, driver
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
      const sellerData = {
        user_id: uid,
        store_name,
        store_description,
        payout_method,
        logo_url: '',
        subscription_tier: 'free',
        created_at: new Date().toISOString(),
      };
      const { error: insertError } = await supabase.from('sellers').upsert([sellerData], { onConflict: 'user_id' });
      if (insertError) {
        console.error('SELLER insert error:', insertError, 'DATA:', sellerData);
        setError(`Failed to save seller info: ${insertError.message || JSON.stringify(insertError)}`);
        setLoading(false);
        return;
      }
      await supabase.from('users').upsert({ id: uid, email: email ?? '', role }, { onConflict: 'id' });
      await new Promise(res => setTimeout(res, 100)); // Let DB update
      const { data: refreshedUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', uid)
        .single();
      const redirectRole = refreshedUser?.role || role;
      router.replace(getRedirectPath(redirectRole));
    } else if (role === 'stylist') {
      const { specialty, bio, instagram, booking_link } = data;
      if (!specialty || !bio || !instagram || !booking_link) {
        setError('All fields required.');
        setLoading(false);
        return;
      }
      const stylistData = {
        user_id: uid,
        specialty,
        bio,
        instagram,
        booking_link,
        created_at: new Date().toISOString(),
      };
      const { error: insertError } = await supabase.from('stylists').upsert([stylistData], { onConflict: 'user_id' });
      if (insertError) {
        console.error('STYLIST insert error:', insertError, 'DATA:', stylistData);
        setError(`Failed to save stylist info: ${insertError.message || JSON.stringify(insertError)}`);
        setLoading(false);
        return;
      }
      await supabase.from('users').upsert({ id: uid, email: email ?? '', role }, { onConflict: 'id' });
      await new Promise(res => setTimeout(res, 100)); // Let DB update
      const { data: refreshedUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', uid)
        .single();
      const redirectRole = refreshedUser?.role || role;
      router.replace(getRedirectPath(redirectRole));
    } else if (role === 'driver') {
      const { vehicle_type, license_number, delivery_radius } = data;
      if (!vehicle_type || !license_number || !delivery_radius) {
        setError('All fields required.');
        setLoading(false);
        return;
      }
      const driverData = {
        user_id: uid,
        vehicle_type,
        license_number,
        delivery_radius: Number(delivery_radius),
        is_online: false,
        created_at: new Date().toISOString(),
      };
      const { error: insertError } = await supabase.from('drivers').upsert([driverData], { onConflict: 'user_id' });
      if (insertError) {
        console.error('Driver insert error:', insertError);
        setError(`Failed to save driver info: ${insertError.message || JSON.stringify(insertError)}`);
        setLoading(false);
        return;
      }
      await supabase.from('users').upsert({ id: uid, email: email ?? '', role }, { onConflict: 'id' });
      await new Promise(res => setTimeout(res, 100)); // Let DB update
      const { data: refreshedUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', uid)
        .single();
      const redirectRole = refreshedUser?.role || role;
      router.replace(getRedirectPath(redirectRole));
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
      // Not logged in: redirect to login
      router.replace('/login');
      return;
    }
    await submitOnboardingDraft(uid, role, formData);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: 'url(/bg/paint-splatter.jpg)' }}
      >
        <div className="bg-black bg-opacity-80 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center border-2 border-yellow-500">
          <img src="/logo.png" alt="StreetStashed Logo" className="h-12 mb-3" />
          <p className="text-xl text-yellow-400 font-extrabold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Step 1: Show role selection if no role yet
  if (!role) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: 'url(/bg/paint-splatter.jpg)' }}
      >
        <div className="bg-black bg-opacity-80 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center border-2 border-yellow-500">
          <img src="/logo.png" alt="StreetStashed Logo" className="h-12 mb-3" />
          <h1 className="text-3xl mb-6 font-extrabold text-yellow-400">Select Your Role</h1>
          {error && <p className="mb-4 text-red-500">{error}</p>}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="mb-6 p-3 text-black rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">-- Choose a role --</option>
            <option value="seller">Seller</option>
            <option value="stylist">Stylist</option>
            <option value="driver">Driver</option>
            <option value="buyer">Buyer</option>
          </select>
          <button
            onClick={handleRoleSelect}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg transition duration-200 w-full shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Onboarding form for seller, stylist, driver
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: 'url(/bg/paint-splatter.jpg)' }}
    >
      <div className="bg-black bg-opacity-80 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center border-2 border-yellow-500">
        <img src="/logo.png" alt="StreetStashed Logo" className="h-12 mb-3" />
        <h1 className="text-3xl mb-6 capitalize font-extrabold text-yellow-400">{role} Onboarding</h1>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="space-y-2">
            {/* all your existing role-specific fields remain here */}
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
          </div>
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg w-full mt-4 shadow-lg transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;