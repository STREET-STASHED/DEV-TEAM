import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useOnboardingRedirect from '@/hooks/useOnboardingRedirect';
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

const supabase = createBrowserSupabaseClient();

export default function Details() {
  const router = useRouter();
  useOnboardingRedirect();


  const [role, setRole] = useState<string>('');
  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Session expired. Please log in again.");
        router.push("/signup");
        return;
      }

      let finalRole = user.user_metadata?.role;

      if (!finalRole) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        finalRole = profile?.role;
      }

      if (finalRole) {
        setRole(finalRole.toLowerCase().trim());
      }
    };

    fetchRole();
  }, []);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!/^\d{10}$/.test(phone)) {
      alert('Please enter a valid 10-digit phone number.');
      setLoading(false);
      return;
    }

    const { data: { user }, error: submitError } = await supabase.auth.getUser();
    if (submitError || !user) {
      alert('Session expired. Please log in again.');
      setLoading(false);
      router.push('/signup');
      return;
    }

    const normalizedRole = role.toLowerCase().trim();

    // if (role) {
    //   Cookies.set('user-role', role, { expires: 7 });
    // }

    // Build update payload
    const updateData: any = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      referral_code: referralCode.trim(),
      details_complete: true,
      onboarded: true
    };

    if (normalizedRole === 'seller') {
      updateData.store_name = storeName;
      updateData.store_description = storeDescription;
    } else if (normalizedRole === 'driver') {
      updateData.vehicle_type = vehicleType;
      updateData.license_number = licenseNumber;
      updateData.payout_method = payoutMethod;
    } else if (normalizedRole === 'stylist') {
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

    // Update users table for all roles (do not update role again to avoid constraint error)
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

    await supabase.auth.updateUser({
      data: {
        role: normalizedRole,
        phone: phone.trim(),
        full_name: fullName.trim(),
        referral_code: referralCode.trim()
      }
    });

    console.log('Details form submitted — redirecting to verification step...');
    // if (role) {
    //   Cookies.set('user-role', role, { expires: 7, path: '/' });
    // }
    // Ensure Supabase session reflects recent update before redirect
    await supabase.auth.refreshSession();
    await router.push('/onboarding/verify');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black bg-opacity-50 px-4 py-8">
      <button
        type="button"
        onClick={() => router.push("/onboarding/role")}
        className="mb-4 text-sm text-gray-300 hover:text-white underline"
      >
        ← Back to Role Selection
      </button>
      <h1 className="text-2xl font-bold text-center text-white mb-6">Complete Your Details</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 text-white p-8 rounded-lg shadow-lg w-full max-w-xl space-y-6"
        data-testid="details-form"
      >
        <input
          type="text"
          placeholder="Full Name"
          required
          value={fullName}
          autoComplete="off"
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="tel"
          placeholder="Phone Number"
          required
          value={phone}
          autoComplete="off"
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Referral Code (optional)"
          value={referralCode}
          autoComplete="off"
          onChange={(e) => setReferralCode(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {(role.toLowerCase().trim() === 'seller') && (
          <>
            <h2 className="text-lg font-semibold mt-4">Store Information</h2>
            <input
              type="text"
              placeholder="Store Name"
              required={role.toLowerCase().trim() === 'seller'}
              value={storeName}
              autoComplete="off"
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Store Description"
              required={role.toLowerCase().trim() === 'seller'}
              value={storeDescription}
              autoComplete="off"
              onChange={(e) => setStoreDescription(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </>
        )}

        {(role.toLowerCase().trim() === 'driver') && (
          <>
            <h2 className="text-lg font-semibold mt-4">Driver Information</h2>
            <input
              type="text"
              placeholder="Vehicle Type"
              required={role.toLowerCase().trim() === 'driver'}
              value={vehicleType}
              autoComplete="off"
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Driver's License Number"
              required={role.toLowerCase().trim() === 'driver'}
              value={licenseNumber}
              autoComplete="off"
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Payout Method"
              required={role.toLowerCase().trim() === 'driver'}
              value={payoutMethod}
              autoComplete="off"
              onChange={(e) => setPayoutMethod(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </>
        )}

        {(role.toLowerCase().trim() === 'stylist') && (
          <>
            <h2 className="text-lg font-semibold mt-4">Stylist Information</h2>
            <input
              type="text"
              placeholder="Specialties"
              required={role.toLowerCase().trim() === 'stylist'}
              value={specialties}
              autoComplete="off"
              onChange={(e) => setSpecialties(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              placeholder="Portfolio URL"
              required={role.toLowerCase().trim() === 'stylist'}
              value={portfolioUrl}
              autoComplete="off"
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Bundle Options"
              required={role.toLowerCase().trim() === 'stylist'}
              value={bundles}
              autoComplete="off"
              onChange={(e) => setBundles(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg text-white font-semibold bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Continue to Verification'}
        </button>
      </form>
    </div>
  );
}
