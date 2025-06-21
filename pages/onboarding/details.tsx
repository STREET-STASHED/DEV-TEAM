import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';

export default function OnboardingDetails() {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Form fields
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [portfolio, setPortfolio] = useState('');

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from('users').select('role').eq('id', user.id).single();
        if (data?.role) setRole(data.role);
      }
      setLoading(false);
    };
    fetchRole();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let updateData: any = { details_complete: true, onboarded: true, role };

    if (role === 'seller') {
      updateData.store_name = storeName;
      updateData.store_description = storeDescription;
    } else if (role === 'driver') {
      updateData.vehicle_type = vehicleType;
      updateData.license_number = licenseNumber;
    } else if (role === 'stylist') {
      updateData.specialties = specialties;
      updateData.portfolio = portfolio;
    }

    const { error } = await supabase.from('users').update(updateData).eq('id', user.id);
    if (error) {
      console.error('Update failed:', error);
      return;
    }

    const redirectMap: Record<string, string> = {
      seller: '/seller/dashboard',
      stylist: '/stylist/dashboard',
      driver: '/driver/dashboard',
      buyer: '/buyer/marketplace',
    };
    router.push(redirectMap[role] || '/');
  };

  if (loading) return <p>Loading...</p>;
  if (!role) return <p className="text-center text-red-500">Role not defined. Please restart onboarding.</p>;

  // Section title based on role
  let sectionTitle = '';
  if (role === 'seller') sectionTitle = 'Seller Onboarding';
  else if (role === 'driver') sectionTitle = 'Driver Onboarding';
  else if (role === 'stylist') sectionTitle = 'Stylist Onboarding';
  else sectionTitle = 'Onboarding';

  return (
    <div className="max-w-xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-center mb-6">{sectionTitle}</h1>
      <div className="bg-white shadow-lg rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {role === 'seller' && (
            <>
              <input
                className="w-full border p-2 rounded"
                placeholder="Store Name"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
              <input
                className="w-full border p-2 rounded"
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
                className="w-full border p-2 rounded"
                placeholder="Vehicle Type"
                required
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Driver’s License Number"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
            </>
          )}
          {role === 'stylist' && (
            <>
              <input
                className="w-full border p-2 rounded"
                placeholder="Specialties"
                required
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Instagram / Portfolio"
                required
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
              />
            </>
          )}
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded w-full"
          >
            {role === 'seller' && 'Start Selling'}
            {role === 'driver' && 'Start Driving'}
            {role === 'stylist' && 'Start Styling'}
            {!['seller', 'driver', 'stylist'].includes(role) && 'Finish Onboarding'}
          </button>
        </form>
      </div>
    </div>
  );
}
