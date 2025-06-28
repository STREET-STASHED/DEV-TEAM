import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';
import Cookies from 'js-cookie';

export default function VerifyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth fetch error:', authError.message);
        return;
      }
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, role, verified, details_complete')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        console.error('Failed to fetch user profile:', error);
        return;
      }

      setUser(data);

      if (!data.details_complete && !data.verified) {
        router.push('/onboarding/details');
        return;
      }

      // If user is already verified, we let the middleware handle redirection
    };

    fetchUser();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleContinue = async () => {
    if (!user || uploading) return;

    setUploading(true);

    let uploadedPath: string | null = null;

    if (file) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(`verify_${user.id}_${Date.now()}`, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert('Failed to upload verification document. Please try again.');
        setUploading(false);
        return;
      }

      uploadedPath = uploadData?.path || null;
    }

    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({
        verified: true,
        verification_complete: true,
        details_complete: true,
        verification_url: uploadedPath,
        full_name: fullName,
        license_number: licenseNumber,
      })
      .eq('id', user.id)
      .select();

    if (updateError || !updateData) {
      console.error('User update error:', updateError, updateData);
      alert('Failed to update your profile. Please try again.');
      setUploading(false);
      return;
    }

    const updatedUser = updateData[0];
    if (updatedUser.role) {
      Cookies.set('user-role', updatedUser.role, { expires: 7 });
    }

    const redirectMap: Record<string, string> = {
      buyer: '/buyer/marketplace',
      seller: '/seller/dashboard',
      stylist: '/stylist/dashboard',
      driver: '/driver/dashboard',
      admin: '/admin/dashboard',
    };

    if (updatedUser.role && redirectMap[updatedUser.role]) {
      if (router.asPath !== redirectMap[updatedUser.role]) {
        router.replace(redirectMap[updatedUser.role]);
      }
    } else {
      if (router.asPath !== '/') {
        router.replace('/');
      }
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Final Verification</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleContinue();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-left mb-1 font-medium">Full Name</label>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded bg-white text-black"
            required
          />
        </div>
        <div>
          <label className="block text-left mb-1 font-medium">License Number</label>
          <input
            type="text"
            placeholder="License Number"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded bg-white text-black"
            required
          />
        </div>
        <div>
          <label className="block text-left mb-1 font-medium">Upload Document</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="w-full bg-white text-black"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-60"
          disabled={uploading}
        >
          {uploading ? 'Submitting...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}