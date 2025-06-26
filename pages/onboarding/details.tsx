import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabaseBrowserClient';

export default function Details() {
  const router = useRouter();
  const [initialLoading, setInitialLoading] = useState(true);
  const [role, setRole] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Seller fields
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');

  // Driver fields
  const [vehicleType, setVehicleType] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('');

  // Stylist fields
  const [specialties, setSpecialties] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [bundles, setBundles] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const user = session?.user;
      if (sessionError || !user) {
        console.error('No active session:', sessionError);
        router.push('/signup');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching role:', error);
        return;
      }
      if (!data?.role) {
        return router.push('/onboarding/role');
      }
      if (data.role === 'buyer') {
        // Buyers skip details and go straight to marketplace
        return router.replace('/buyer/marketplace');
      }
      setRole(data.role);
      setInitialLoading(false);
    };
    init();
  }, [router, supabase]);

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">Loading your onboarding step…</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session }, error: submitError } = await supabase.auth.getSession();
    const user = session?.user;
    if (submitError || !user) {
      alert('Session expired. Please log in again.');
      return router.push('/signup');
    }

    // Build update payload
    const updateData: any = {
      full_name: fullName,
      phone_number: phoneNumber,
      referral_code: referralCode,
      details_complete: true,
    };

    if (role === 'seller') {
      updateData.store_name = storeName;
      updateData.store_description = storeDescription;
    } else if (role === 'driver') {
      updateData.vehicle_type = vehicleType;
      updateData.license_number = licenseNumber;
      updateData.payout_method = payoutMethod;
    } else if (role === 'stylist') {
      // Stylists handled in a separate table
      const { error: stylistError } = await supabase
        .from('stylist_applications')
        .upsert({
          id: user.id,
          full_name: fullName,
          email: user.email,
          specialties,
          portfolio_url: portfolioUrl,
          bundles,
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      if (stylistError) {
        console.error('Stylist application error:', stylistError.message);
        alert('Failed to save stylist details. Please try again.');
        setLoading(false);
        return;
      }
    }

    // Update users table for seller and driver, and mark details_complete for all roles
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id);
    if (updateError) {
      console.error('User update error:', updateError.message);
      alert('Failed to save details. Please try again.');
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push('/onboarding/verify');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md space-y-6">
        <h1 className="text-2xl font-bold text-center">Complete Your Details</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md"
          />
          <input
            type="text"
            placeholder="Referral Code (optional)"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md"
          />

          {(role === 'seller') && (
            <>
              <input
                type="text"
                placeholder="Store Name"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md"
              />
              <textarea
                placeholder="Store Description"
                required
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md"
              />
            </>
          )}

          {(role === 'driver') && (
            <>
              <input
                type="text"
                placeholder="Vehicle Type"
                required
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md"
              />
              <input
                type="text"
                placeholder="Driver's License Number"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md"
              />
              <input
                type="text"
                placeholder="Payout Method"
                required
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md"
              />
            </>
          )}

          {(role === 'stylist') && (
            <>
              <input
                type="text"
                placeholder="Specialties"
                required
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md"
              />
              <input
                type="url"
                placeholder="Portfolio URL"
                required
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md"
              />
              <textarea
                placeholder="Bundle Options"
                required
                value={bundles}
                onChange={(e) => setBundles(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md"
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-md"
          >
            {loading ? 'Submitting...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
