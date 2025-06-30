'use client';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getDashboardRedirect } from '@/lib/getDashboardRedirect';

export default function VerifyPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  // ← NO call to useOnboardingRedirect()

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

    // — get user
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      setError('Session expired—please log in.');
      router.push('/signup');
      return setUploading(false);
    }

    // — upload file
    const ext = file.name.split('.').pop();
    const fileName = `${user.id}.${ext}`;
    const { data: up, error: upErr } = await supabase
      .storage.from('verification-docs')
      .upload(fileName, file);
    if (upErr) {
      setError(upErr.message);
      return setUploading(false);
    }

    // — update profile
    const { data: updatedUser, error: updErr } = await supabase
      .from('users')
      .update({
        full_name:       fullName,
        license_number:  licenseNumber,
        verification_url: up.path,
        verified:        true,
        details_complete: true,
      })
      .eq('id', user.id)
      .select()
      .single();
    if (updErr || !updatedUser) {
      setError(updErr?.message || 'Could not update profile.');
      return setUploading(false);
    }

    // — refresh & re-fetch role
    await supabase.auth.refreshSession();
    const { data: freshProfile, error: profErr } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profErr || !freshProfile?.role) {
      setError('Could not fetch your role.');
      return setUploading(false);
    }

    // ← **force** the correct dashboard
    const roleKey = freshProfile.role.toLowerCase();
    const dest = getDashboardRedirect(roleKey);
    router.replace(dest);
  };

  return (
    <div>…</div>
  );
}