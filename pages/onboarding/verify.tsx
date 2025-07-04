'use client';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { createBrowserClient } from '@supabase/ssr';
import { getDashboardRedirect } from '@/lib/getDashboardRedirect';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function VerifyPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );


  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [file, setFile]         = useState<File | null>(null);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploading(true);

    if (!fullName || !licenseNumber || !file) {
      setError('Please fill out all fields and select a document.');
      return setUploading(false);
    }

    const ext = file.name.split('.').pop();
    if (!ext) {
      setError('Invalid file format.');
      return setUploading(false);
    }

    const fileName = `${crypto.randomUUID()}.${ext}`;
    const { data: up, error: upErr } = await supabase
      .storage.from('verification-docs')
      .upload(fileName, file);
    if (upErr) {
      setError(upErr.message);
      return setUploading(false);
    }

    const { data: signedUrlData, error: signedUrlErr } = await supabase
      .storage.from('verification-docs')
      .createSignedUrl(fileName, 60 * 60);

    if (signedUrlErr || !signedUrlData?.signedUrl) {
      setError('Failed to generate access link.');
      return setUploading(false);
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('User not authenticated.');
        return;
      }

      const updates = {
        full_name: fullName,
        license_number: licenseNumber,
        verification_url: signedUrlData.signedUrl,
        has_completed_onboarding: true,
        details_complete: true,
        role: 'agent'
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      const roleKey = updates.role.toLowerCase() || 'buyer';
      const dest = getDashboardRedirect(roleKey);
      router.replace(dest);
    } catch (err: any) {
      setError(err?.message || 'Onboarding failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ProtectedLayout supabaseClient={supabase}>
      <div className="min-h-screen flex items-center justify-center bg-black px-4 py-10">
        <form
          onSubmit={handleContinue}
          className="w-full max-w-xl bg-gray-900 text-white p-8 rounded-lg shadow-lg space-y-6"
        >
          <h1 className="text-2xl font-bold text-center mb-4">Verify Your Identity</h1>

          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:outline-none"
          />

          <input
            type="text"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="Driver’s License / ID Number"
            className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:outline-none"
          />

          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept="image/*,.pdf"
            className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 hover:file:bg-yellow-600"
          />

          {error && <p className="text-red-400 animate-pulse text-center">{error}</p>}

          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-3 rounded-lg font-semibold ${
              uploading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            {uploading ? 'Verifying…' : 'Submit and Finish'}
          </button>
        </form>
      </div>
    </ProtectedLayout>
  );
}