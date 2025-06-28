

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';
import Cookies from 'js-cookie';

export default function VerifyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
        .from('verifications')
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

    router.push(redirectMap[user.role] || '/');
  };

  return (
    <div className="container mx-auto py-10 text-center">
      <h1 className="text-2xl font-bold mb-4">Upload Verification Document</h1>
      <input type="file" onChange={handleFileChange} className="mb-4" />
      <button
        onClick={handleContinue}
        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        disabled={uploading}
      >
        {uploading ? 'Submitting...' : 'Continue'}
      </button>
    </div>
  );
}