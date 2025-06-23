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

    const { error } = await supabase.from('users').update(updateData).eq('id', user.id);
    if (error) {
      console.error('Update failed:', error);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    router.push('/dashboard');
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
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto mt-8">
          <h1 className="text-3xl font-bold text-center mb-6">{sectionTitle}</h1>
          <div className="bg-white shadow-md rounded-lg p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                className="w-full border p-3 rounded text-black placeholder-gray-400"
                placeholder="Full Name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <input
                className="w-full border p-3 rounded text-black placeholder-gray-400"
                placeholder="Phone Number"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {role === 'seller' && (
                <>
                  <input
                    className="w-full border p-3 rounded text-black placeholder-gray-400"
                    placeholder="Store Name"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                  <input
                    className="w-full border p-3 rounded text-black placeholder-gray-400"
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
                    className="w-full border p-3 rounded text-black placeholder-gray-400"
                    placeholder="Vehicle Type"
                    required
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                  />
                  <input
                    className="w-full border p-3 rounded text-black placeholder-gray-400"
                    placeholder="Driver’s License Number"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                  />
                  <input
                    className="w-full border p-3 rounded text-black placeholder-gray-400"
                    placeholder="Delivery Radius (miles)"
                    required
                    value={deliveryRadius}
                    onChange={(e) => setDeliveryRadius(e.target.value)}
                  />
                  <input
                    className="w-full border p-3 rounded text-black placeholder-gray-400"
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
                    className="w-full border p-3 rounded text-black placeholder-gray-400"
                    placeholder="Specialties"
                    required
                    value={specialties}
                    onChange={(e) => setSpecialties(e.target.value)}
                  />
                  <input
                    className="w-full border p-3 rounded text-black placeholder-gray-400"
                    placeholder="Instagram / Portfolio"
                    required
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                  />
                  <input
                    className="w-full border p-3 rounded text-black placeholder-gray-400"
                    placeholder="Booking Availability"
                    required
                    value={booking}
                    onChange={(e) => setBooking(e.target.value)}
                  />
                  <input
                    className="w-full border p-3 rounded text-black placeholder-gray-400"
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
                className={`bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg shadow-md w-full transition duration-200 ease-in-out ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {role === 'seller' && 'Start Selling'}
                {role === 'driver' && 'Start Driving'}
                {role === 'stylist' && 'Start Styling'}
                {!['seller', 'driver', 'stylist'].includes(role) && 'Finish Onboarding'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
