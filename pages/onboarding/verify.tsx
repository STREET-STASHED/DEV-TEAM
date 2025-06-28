import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';
import Cookies from 'js-cookie';

export default function VerifyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [govId, setGovId] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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

      if (!data.details_complete) {
        router.push('/onboarding/details');
        return;
      }

      if (data.verified && data.role) {
        const redirectMap: Record<string, string> = {
          buyer: '/buyer/marketplace',
          seller: '/seller/dashboard',
          stylist: '/stylist/dashboard',
          driver: '/driver/dashboard',
          admin: '/admin/dashboard',
        };
        router.push(redirectMap[data.role] || '/');
      }
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
        setUploading(false);
        return;
      }

      uploadedPath = uploadData?.path || null;
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        verified: true,
        verification_file: uploadedPath,
        full_name: fullName,
        government_id: govId,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('User update error:', updateError);
      setUploading(false);
      return;
    }

    Cookies.set('user-role', user.role, { expires: 7 });

    const redirectMap: Record<string, string> = {
      buyer: '/buyer/marketplace',
      seller: '/seller/dashboard',
      stylist: '/stylist/dashboard',
      driver: '/driver/dashboard',
      admin: '/admin/dashboard',
    };

    if (user.role && redirectMap[user.role]) {
      router.replace(redirectMap[user.role]);
    } else {
      router.replace('/');
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
            className="w-full border border-gray-300 px-4 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-left mb-1 font-medium">Government ID Number</label>
          <input
            type="text"
            placeholder="Government ID Number"
            value={govId}
            onChange={(e) => setGovId(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-left mb-1 font-medium">Upload Document</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full"
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