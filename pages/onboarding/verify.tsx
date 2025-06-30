'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getDashboardRedirect } from '@/lib/getDashboardRedirect';

export default function VerifyPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleContinue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setUploading(true);

    if (!fullName || !licenseNumber || !file) {
      setError('Please fill out all fields and select a document.');
      setUploading(false);
      return;
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      setError('Session expired. Please log in again.');
      setUploading(false);
      router.push('/signup');
      return;
    }

    // Upload file to storage bucket "verification-docs"
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('verification-docs')
      .upload(fileName, file);

    if (uploadError || !uploadData) {
      setError(uploadError?.message || 'Upload failed.');
      setUploading(false);
      return;
    }

    const verificationUrl = uploadData.path;

    // Update user profile with verification fields
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        license_number: licenseNumber,
        verification_url: verificationUrl,
        verified: true,
        details_complete: true,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError || !updatedUser) {
      setError(updateError?.message || 'Could not update profile.');
      setUploading(false);
      return;
    }

    // Redirect to the correct dashboard
    const redirectPath = getDashboardRedirect(updatedUser.role || '');
    router.push(redirectPath);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleContinue}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6">Verify Your Account</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <label className="block mb-4">
          <span className="text-gray-700">Full Name</span>
          <input
            name="fullName"
            type="text"
            className="mt-1 block w-full border rounded p-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">License Number</span>
          <input
            name="licenseNumber"
            type="text"
            className="mt-1 block w-full border rounded p-2"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            required
          />
        </label>

        <label className="block mb-6">
          <span className="text-gray-700">Upload Document</span>
          <input
            name="verificationFile"
            type="file"
            accept="image/*,application/pdf"
            className="mt-1 block w-full"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
        </label>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}  