import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabaseClient';

export default function Details() {
  const router = useRouter();
  const [initialLoading, setInitialLoading] = useState(true);
  const [role, setRole] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

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
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        const user = session?.user;
        if (sessionError || !user) {
          console.error('Session fetch error or no user:', sessionError);
          router.push('/signup');
          return;
        }

        console.log('User ID:', user.id);

        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching role:', error);
          return;
        }

        if (!data?.role || ['buyer', null].includes(data.role)) {
          console.warn('No valid role set yet. Redirecting to role selection.');
          router.push('/onboarding/role');
          return;
        }

        if (data?.role) {
          setRole(data.role);
          Cookies.set('user-role', data.role, { expires: 7 });
        }
        console.log("Loaded role:", data.role);
        // demo defaults
        setFullName('Test User');
        setPhone('4125551234');
        setReferralCode('');
        setStoreName('StreetStyles');
        setStoreDescription('Trendy fashion and streetwear.');
        setVehicleType('Sedan');
        setLicenseNumber('D12345678');
        setPayoutMethod('Cash App: $streetuser');
        setSpecialties('Urban fashion, event styling');
        setPortfolioUrl('https://portfolio.testuser.com');
        setBundles('Weekend Fits, Event Ready Packages');

        setInitialLoading(false);
      } catch (e) {
        console.error('Unhandled error in init():', e);
        setInitError('An unexpected error occurred while loading your details. Please try refreshing the page.');
        setInitialLoading(false);
      }
    };
    init();
  }, [router]);

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">Loading your onboarding step…</p>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-semibold">{initError}</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!/^\d{10}$/.test(phone)) {
      alert('Please enter a valid 10-digit phone number.');
      setLoading(false);
      return;
    }

    const { data: { session }, error: submitError } = await supabase.auth.getSession();
    const user = session?.user;
    if (submitError || !user) {
      alert('Session expired. Please log in again.');
      setLoading(false);
      router.push('/signup');
      return;
    }

    if (role) {
      Cookies.set('user-role', role, { expires: 7 });
    }

    // Build update payload
    const updateData: any = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      referral_code: referralCode.trim(),
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
      try {
        // Validate portfolio URL format
        if (portfolioUrl) {
          new URL(portfolioUrl);
        }
      } catch {
        alert('Portfolio URL is not valid. Please enter a valid URL.');
        setLoading(false);
        return;
      }
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

    console.log('Details form submitted — redirecting to verification step...');
    if (role) {
      Cookies.set('user-role', role, { expires: 7, path: '/' });
    }
    // Ensure Supabase session reflects recent update before redirect
    await supabase.auth.refreshSession(); // Ensures session reflects recent update
    await router.push('/onboarding/verify');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold text-center text-black mb-6">Complete Your Details</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col gap-4"
        data-testid="details-form"
      >
        <input
          type="text"
          placeholder="Full Name"
          required
          value={fullName}
          autoComplete="off"
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-md text-black"
        />
        <input
          type="tel"
          placeholder="Phone Number"
          required
          value={phone}
          autoComplete="off"
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-md text-black"
        />
        <input
          type="text"
          placeholder="Referral Code (optional)"
          value={referralCode}
          autoComplete="off"
          onChange={(e) => setReferralCode(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-md text-black"
        />

        {(role === 'seller') && (
          <>
            <input
              type="text"
              placeholder="Store Name"
              required={role === 'seller'}
              value={storeName}
              autoComplete="off"
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md text-black"
            />
            <textarea
              placeholder="Store Description"
              required={role === 'seller'}
              value={storeDescription}
              autoComplete="off"
              onChange={(e) => setStoreDescription(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md text-black"
            />
          </>
        )}

        {(role === 'driver') && (
          <>
            <input
              type="text"
              placeholder="Vehicle Type"
              required={role === 'driver'}
              value={vehicleType}
              autoComplete="off"
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md text-black"
            />
            <input
              type="text"
              placeholder="Driver's License Number"
              required={role === 'driver'}
              value={licenseNumber}
              autoComplete="off"
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md text-black"
            />
            <input
              type="text"
              placeholder="Payout Method"
              required={role === 'driver'}
              value={payoutMethod}
              autoComplete="off"
              onChange={(e) => setPayoutMethod(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md text-black"
            />
          </>
        )}

        {(role === 'stylist') && (
          <>
            <input
              type="text"
              placeholder="Specialties"
              required={role === 'stylist'}
              value={specialties}
              autoComplete="off"
              onChange={(e) => setSpecialties(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md text-black"
            />
            <input
              type="url"
              placeholder="Portfolio URL"
              required={role === 'stylist'}
              value={portfolioUrl}
              autoComplete="off"
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md text-black"
            />
            <textarea
              placeholder="Bundle Options"
              required={role === 'stylist'}
              value={bundles}
              autoComplete="off"
              onChange={(e) => setBundles(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md text-black"
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-md"
        >
          {loading ? 'Submitting...' : 'Continue to Verification'}
        </button>
      </form>
    </div>
  );
}
