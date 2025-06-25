import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';

export default function OnboardingDetails() {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/signup');
      }
    };
    checkUser();
  }, [router]);

  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryRadius, setDeliveryRadius] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('');
  const [booking, setBooking] = useState('');
  const [bundles, setBundles] = useState('');

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from('users').select('role').eq('id', user.id).single();
        if (data?.role) {
          setRole(data.role);
        } else {
          router.push('/onboarding/role');
        }
      } else {
        console.warn('No user found in supabase auth:', userError);
        router.push('/onboarding/role');
      }
      setLoading(false);
    };
    fetchRole();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }

    let updateData: any = {
      details_complete: true,
      onboarded: true,
      role,
      full_name: fullName,
      phone,
      verified: false,
    };

    if (role === 'seller') {
      updateData.store_name = storeName;
      updateData.store_description = storeDescription;
    } else if (role === 'driver') {
      updateData.vehicle_type = vehicleType;
      updateData.license_number = licenseNumber;
      updateData.delivery_radius = deliveryRadius;
      updateData.payout_method = payoutMethod;
    } else if (role === 'stylist') {
      updateData.specialties = specialties;
      updateData.portfolio = portfolio;
      updateData.booking = booking;
      updateData.bundles = bundles;
    }

    const { data: updateResult, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select();

    if (error) {
      console.error('Update failed:', error.message);
      setSubmitting(false);
      return;
    }

    if (!updateResult || updateResult.length === 0) {
      console.error('Update returned no data. Check if user exists and row-level security (RLS) policies allow updates.');
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    router.push('/onboarding/verify');
  };

  if (loading) return <p>Loading...</p>;
  if (!role) return (
    <div className="text-center text-red-500 mt-10">
      <p>Role not defined. Please restart onboarding or contact support.</p>
      <button
        onClick={() => router.push('/onboarding/role')}
        className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded"
      >
        Choose Role
      </button>
    </div>
  );

  if (role === 'buyer') {
    router.push('/buyer/marketplace');
    return null;
  }

  let sectionTitle = '';
  if (role === 'seller') sectionTitle = 'Seller Onboarding';
  else if (role === 'driver') sectionTitle = 'Driver Onboarding';
  else if (role === 'stylist') sectionTitle = 'Stylist Onboarding';
  else sectionTitle = 'Onboarding';

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">{sectionTitle}</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              className="w-full border border-gray-300 p-3 rounded-md text-black placeholder-gray-500"
              placeholder="Full Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              className="w-full border border-gray-300 p-3 rounded-md text-black placeholder-gray-500"
              placeholder="Phone Number"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {role === 'seller' && (
              <>
                <input
                  className="w-full border border-gray-300 p-3 rounded-md text-black placeholder-gray-500"
                  placeholder="Store Name"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
                <input
                  className="w-full border border-gray-300 p-3 rounded-md text-black placeholder-gray-500"
                  placeholder="Store Description"
                  required
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                />
              </>
            )}
            {role === 'driver' && (
              <>
                <input
                  className="w-full border border-gray-300 p-3 rounded-md text-black placeholder-gray-500"
                  placeholder="Vehicle Type"
                  required
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                />
                <input
                  className="w-full border border-gray-300 p-3 rounded-md text-black placeholder-gray-500"
                  placeholder="Driver’s License Number"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                />
                <input
                  className="w-full border border-gray-300 p-3 rounded-md text-black placeholder-gray-500"
                  placeholder="Delivery Radius (miles)"
                  required
                  value={deliveryRadius}
                  onChange={(e) => setDeliveryRadius(e.target.value)}
                />
                <input
                  className="w-full border border-gray-300 p-3 rounded-md text-black placeholder-gray-500"
                  placeholder="Cash App / Bank Info"
                  required
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                />
              </>
            )}
            {role === 'stylist' && (
              <>
                <input
                  className="w-full border border-gray-300 p-3 rounded-md text-black placeholder-gray-500"
                  placeholder="Specialties"
                  required
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                />
                <input
                  className="w-full border border-gray-300 p-3 rounded-md text-black placeholder-gray-500"
                  placeholder="Instagram / Portfolio"
                  required
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                />
                <input
                  className="w-full border border-gray-300 p-3 rounded-md text-black placeholder-gray-500"
                  placeholder="Booking Availability"
                  required
                  value={booking}
                  onChange={(e) => setBooking(e.target.value)}
                />
                <input
                  className="w-full border border-gray-300 p-3 rounded-md text-black placeholder-gray-500"
                  placeholder="Bundle Options (Event / Weekly)"
                  required
                  value={bundles}
                  onChange={(e) => setBundles(e.target.value)}
                />
              </>
            )}
            <button
              type="submit"
              disabled={submitting}
              className={`bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-md w-full transition duration-200 ease-in-out ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Submitting...' :
                role === 'seller' ? 'Start Selling' :
                role === 'driver' ? 'Start Driving' :
                role === 'stylist' ? 'Start Styling' :
                'Finish Onboarding'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
