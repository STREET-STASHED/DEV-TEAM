'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createBrowserClient } from '@supabase/ssr';
import ProtectedLayout from '../../components/ProtectedLayout';
import { useOnboarding } from '@/hooks/useOnboarding';

type Profile = {
  id: string;
  business_license_url?: string;
  brand_logo_url?: string;
  additional_document_url?: string;
  onboarding_step?: string;
  has_completed_onboarding?: boolean;
  verification_submitted_at?: string;
  updated_at?: string;
};

export default function VerifyPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { profile, completeOnboarding, updateProfile, refreshProfile } = useOnboarding();

  const [files, setFiles] = useState({
    business_license: null,
    brand_logo: null,
    additional_document: null
  });

  const [fileUrls, setFileUrls] = useState({
    business_license: profile?.business_license_url || null,
    brand_logo: profile?.brand_logo_url || null,
    additional_document: profile?.additional_document_url || null
  });

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile && profile.onboarding_step !== 'verify') {
      if (profile.onboarding_step === 'details') {
        router.push('/onboarding/details');
      } else {
        router.push('/onboarding');
      }
    }
  }, [profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;

    if (selectedFiles && selectedFiles[0]) {
      setFiles(prev => ({
        ...prev,
        [name]: selectedFiles[0]
      }));

      const fileUrl = URL.createObjectURL(selectedFiles[0]);
      setFileUrls(prev => ({
        ...prev,
        [name]: fileUrl
      }));
    }
  };

  const uploadFile = async (file: File, path: string) => {
    if (!file) return null;

    const ext = file.name.split('.').pop();
    const fileName = `${profile?.id}-${Date.now()}.${ext}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('verification')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('verification')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    try {
      const updates: any = {};

      if (files.business_license) {
        updates.business_license_url = await uploadFile(files.business_license, 'business-licenses');
      }

      if (files.brand_logo) {
        updates.brand_logo_url = await uploadFile(files.brand_logo, 'brand-logos');
      }

      if (files.additional_document) {
        updates.additional_document_url = await uploadFile(files.additional_document, 'additional-documents');
      }

      updates.verification_submitted_at = new Date().toISOString();

      const { error: profileUpdateError } = await updateProfile(updates);
      if (profileUpdateError) throw profileUpdateError;

      const { error: completeError } = await completeOnboarding();
      if (completeError) throw completeError;

      await refreshProfile();
    } catch (err: any) {
      console.error('Verification failed:', err);
      setError(err.message || 'Failed to complete verification.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ProtectedLayout supabaseClient={supabase}>
      <div className="min-h-screen flex items-center justify-center bg-black px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl bg-gray-900 text-white p-8 rounded-lg shadow-lg space-y-6"
        >
          <h1 className="text-2xl font-bold text-center mb-4">Verify Your Brand</h1>
          <p className="text-center text-sm text-gray-400 mb-6">
            Upload your business license, brand logo, and any additional documents.
          </p>

          <div className="space-y-4">
            <label className="block">
              <span>Business License</span>
              <input
                type="file"
                name="business_license"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="mt-1 w-full text-sm text-gray-300"
              />
            </label>

            <label className="block">
              <span>Brand Logo</span>
              <input
                type="file"
                name="brand_logo"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 w-full text-sm text-gray-300"
              />
            </label>

            <label className="block">
              <span>Additional Document (optional)</span>
              <input
                type="file"
                name="additional_document"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="mt-1 w-full text-sm text-gray-300"
              />
            </label>
          </div>

          {error && <p className="text-red-400 text-center animate-pulse">{error}</p>}

          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => router.push('/onboarding/details')}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={uploading || !files.business_license}
              className={`py-2 px-6 rounded font-semibold ${
                uploading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              {uploading ? 'Submitting...' : 'Complete Verification'}
            </button>
          </div>
        </form>
      </div>
    </ProtectedLayout>
  );
}