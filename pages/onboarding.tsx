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

  const [formData, setFormData] = useState({
    // Stylist fields
    specialty: '',
    bio: '',
    instagram: '',
    booking_link: '',
    // Seller fields
    store_name: '',
    store_description: '',
    payout_method: '',
    // Driver fields
    vehicle_type: '',
    license_number: '',
    delivery_radius: '',
  });

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

    if (selectedRole === 'buyer') {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData?.session?.user?.email;
      const { error } = await supabase
        .from('users')
        .upsert({ id: userId, email: email ?? '', role: 'buyer' }, { onConflict: 'id' });

      if (error) {
        setError('Failed to update role. Try again.');
        setLoading(false);
        return;
      }

      router.push(getRedirectPath('buyer'));
    } else {
      // For seller, stylist, driver show form
      setRole(selectedRole);
    }
  }

  async function handleStylistSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const { specialty, bio, instagram, booking_link } = formData;
    if (!specialty || !bio || !instagram || !booking_link) {
      setError('Please fill in all fields.');
      return;
    }
    if (!userId) {
      setError('User not authenticated.');
      return;
    }
    setLoading(true);

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      setError('User not found.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('stylists').insert([
      {
        user_id: userData.id,
        specialty,
        bio,
        instagram,
        booking_link,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      setError('Failed to save stylist information. Try again.');
      setLoading(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const email = sessionData?.session?.user?.email;
    const { error: roleError } = await supabase
      .from('users')
      .upsert({ id: userId, email: email ?? '', role: 'stylist' }, { onConflict: 'id' });

    if (roleError) {
      setError('Failed to update role. Try again.');
      setLoading(false);
      return;
    }

    router.push(getRedirectPath('stylist'));
  }

  async function handleSellerSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const { store_name, store_description, payout_method } = formData;
    if (!store_name || !store_description || !payout_method) {
      setError('Please fill in all fields.');
      return;
    }
    if (!userId) {
      setError('User not authenticated.');
      return;
    }
    setLoading(true);

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      setError('User not found.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('sellers').insert([
      {
        user_id: userData.id,
        store_name,
        store_description,
        payout_method,
        logo_url: '', // Assuming empty string as no logo upload here
        subscription_tier: 'free', // Default subscription tier
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      setError('Failed to save seller information. Try again.');
      setLoading(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const email = sessionData?.session?.user?.email;
    const { error: roleError } = await supabase
      .from('users')
      .upsert({ id: userId, email: email ?? '', role: 'seller' }, { onConflict: 'id' });

    if (roleError) {
      setError('Failed to update role. Try again.');
      setLoading(false);
      return;
    }

    router.push(getRedirectPath('seller'));
  }

  async function handleDriverSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const { vehicle_type, license_number, delivery_radius } = formData;
    if (!vehicle_type || !license_number || !delivery_radius) {
      setError('Please fill in all fields.');
      return;
    }
    if (!userId) {
      setError('User not authenticated.');
      return;
    }
    setLoading(true);

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      setError('User not found.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('drivers').insert([
      {
        user_id: userData.id,
        vehicle_type,
        license_number,
        delivery_radius,
        is_online: false,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      setError('Failed to save driver information. Try again.');
      setLoading(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const email = sessionData?.session?.user?.email;
    const { error: roleError } = await supabase
      .from('users')
      .upsert({ id: userId, email: email ?? '', role: 'driver' }, { onConflict: 'id' });

    if (roleError) {
      setError('Failed to update role. Try again.');
      setLoading(false);
      return;
    }

    router.push(getRedirectPath('driver'));
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

  if (role === 'stylist') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-yellow-400 font-graffiti px-4">
        <h1 className="text-3xl mb-6">Stylist Onboarding</h1>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <form onSubmit={handleStylistSubmit} className="w-full max-w-md">
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
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded w-full"
          >
            Submit
          </button>
        </form>
      </div>
    );
  }

  if (role === 'seller') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-yellow-400 font-graffiti px-4">
        <h1 className="text-3xl mb-6">Seller Onboarding</h1>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <form onSubmit={handleSellerSubmit} className="w-full max-w-md">
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
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded w-full"
          >
            Submit
          </button>
        </form>
      </div>
    );
  }

  if (role === 'driver') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-yellow-400 font-graffiti px-4">
        <h1 className="text-3xl mb-6">Driver Onboarding</h1>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <form onSubmit={handleDriverSubmit} className="w-full max-w-md">
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
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded w-full"
          >
            Submit
          </button>
        </form>
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