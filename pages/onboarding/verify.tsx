import { useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getDashboardRedirect } from '@/lib/getDashboardRedirect';

const supabase = createClientComponentClient();

export default function VerifyPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleContinue = async () => {
    setUploading(true);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      alert('Session expired. Please log in again.');
      router.push('/login');
      return;
    }

    let uploadedPath: string | null = null;

    if (file) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(`verify_${user.id}_${Date.now()}`, file);

      if (uploadError) {
        alert('Document upload failed.');
        setUploading(false);
        return;
      }

      uploadedPath = uploadData?.path || null;
    }

    // Prepare updates object, ensuring 'role' is not included
    const updates: any = {
      verified: true,
      details_complete: true,
      verification_url: uploadedPath,
      full_name: fullName,
      license_number: licenseNumber,
    };

    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select();

    if (updateError || !updateData) {
      alert('Profile update failed.');
      setUploading(false);
      return;
    }

    const updatedUser = updateData[0];
    // Log the updated user after verify
    console.log("Updated user after verify:", updatedUser);

    if (!updatedUser) {
      alert('User update failed. Please try again.');
      setUploading(false);
      return;
    }

    const userRole = updatedUser.role?.toLowerCase?.();
    // Log the detected user role
    console.log("Detected user role:", userRole);

    if (!userRole) {
      alert('Missing role information. Please complete your profile or contact support.');
      setUploading(false);
      return;
    }

    // Use fallback redirect logic
    const redirectPath = getDashboardRedirect(userRole) || '/';
    router.push(redirectPath);
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