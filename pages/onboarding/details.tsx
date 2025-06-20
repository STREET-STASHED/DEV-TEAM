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

    let updateData: any = { details_complete: true };

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

    await supabase.from('users').update(updateData).eq('id', user.id);

    // Redirect based on role and details_complete flag
    const redirectMap: Record<string, string> = {
      buyer: '/buyer/marketplace',
      seller: '/seller/dashboard',
      stylist: '/stylist/dashboard',
      driver: '/driver/dashboard',
    };
    router.push(redirectMap[role] || '/');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 space-y-4">
      {role === 'seller' && (
        <>
          <h2 className="text-2xl font-bold mb-2">Seller Onboarding</h2>
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
          <h2 className="text-2xl font-bold mb-2">Driver Onboarding</h2>
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
          <h2 className="text-2xl font-bold mb-2">Stylist Onboarding</h2>
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
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded"
      >
        Finish Onboarding
      </button>
    </form>
  );
}
