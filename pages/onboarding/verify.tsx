import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabaseClient';
import Cookies from 'js-cookie';

export default function VerifyStep() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [license, setLicense] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const fetchUserAndDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: userData, error } = await supabase
        .from('users')
        .select('role, details_complete, verified')
        .eq('id', user.id)
        .single();

      if (!userData || !userData.role) {
        console.warn('Missing user data or role.');
        router.push('/onboarding/role');
        return;
      }
      // Set role and cookie before any redirect check to avoid race conditions
      setRole(userData.role);
      Cookies.set('user-role', userData.role, { expires: 7 });

      if (!userData.details_complete && !userData.verified) {
        router.push('/onboarding/details');
        return;
      }

      if (userData.verified) {
        const redirectMap: Record<string, string> = {
          buyer: '/buyer/marketplace',
          seller: '/seller/dashboard',
          stylist: '/stylist/dashboard',
          driver: '/driver/dashboard',
        };
        await router.push(redirectMap[userData.role] || '/');
        return;
      }
    };

    fetchUserAndDetails();
  }, []);

  useEffect(() => {
    setFullName('Test User');
    setLicense('TEST123456');
    setAgreed(true);
  }, []);

  const handleContinue = async () => {
    if (loading) return;
    try {
      setLoading(true);

      // Ensure Supabase session is available before any protected operation
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!session) {
        console.error('No Supabase session found. User must be logged in.');
        alert('You must be logged in to verify.');
        setLoading(false);
        return;
      }

      if (!userId || !role) {
        alert('User information is incomplete.');
        setLoading(false);
        return;
      }

      if (['driver', 'seller', 'stylist'].includes(role)) {
        if (
          !fullName.trim() ||
          !license.trim() ||
          !agreed
        ) {
          alert('Please fill in all verification fields and agree to the terms.');
          setLoading(false);
          return;
        }

        if (documentFile && documentFile.size > 5 * 1024 * 1024) {
          alert('File size must be under 5MB.');
          setLoading(false);
          return;
        }

          if (documentFile) {
            // 1) Upload to storage
            const filePath = `${userId}/${role}-docs/${documentFile.name}`;
            const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'verification-docs';
            console.log('Uploading to bucket:', bucketName);

            // upload
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from(bucketName)
              .upload(filePath, documentFile, { cacheControl: '3600', upsert: true });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            alert(`Upload failed: ${uploadError.message}`);
            setLoading(false);
            return;
          }

          // 2) Create a signed URL (valid for 24 hours)
          const { data: urlData, error: urlError } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(uploadData.path, 60 * 60 * 24);

          if (urlError) {
            console.warn('Signed URL error:', urlError);
          }

          // 3) Save verification info on user
          const { error: updateError } = await supabase
            .from('users')
            .update({
              verified: true,
              full_name: fullName.trim(),
              license_number: license.trim(),
              // removed: verification_file
              verification_url: urlData?.signedUrl ?? null,
              // TODO: Replace '' with actual phone state variable when available
              phone: '',
            })
            .eq('id', userId);

          if (updateError) {
            console.error('User update error:', updateError);
            alert(`Verification failed: ${updateError.message}`);
            setLoading(false);
            return;
          }
          Cookies.set('user-role', role, { expires: 7 });
        } else {
          // Skip file upload, just update user info and mark verified
          const { error: updateError } = await supabase
            .from('users')
            .update({
              verified: true,
              full_name: fullName.trim(),
              license_number: license.trim(),
              // removed: verification_file
              verification_url: null,
              // TODO: Replace '' with actual phone state variable when available
              phone: '',
            })
            .eq('id', userId);

          if (updateError) {
            console.error('User update error:', updateError);
            alert(`Verification failed: ${updateError.message}`);
            setLoading(false);
            return;
          }
          Cookies.set('user-role', role, { expires: 7 });
        }
      }

      const redirectMap: Record<string, string> = {
        buyer: '/buyer/marketplace',
        seller: '/seller/dashboard',
        stylist: '/stylist/dashboard',
        driver: '/driver/dashboard',
        admin: '/admin/dashboard',
      };

      await router.push(redirectMap[role] || '/');
    } catch (err) {
      console.error('Unexpected error in verification:', err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 bg-black text-white shadow rounded-lg">
      <h2 className="text-3xl font-bold">Final Verification</h2>

      {['driver', 'seller', 'stylist'].includes(role) ? (
        <>
          <p className="text-white mb-4">
            Please provide the required verification details.
          </p>

          <label className="block text-sm mb-1">Full Legal Name</label>
          <input
            type="text"
            className="block w-full px-4 py-2 mb-4 text-black rounded"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="off"
          />

          <label className="block text-sm mb-1">
            Upload License / Store Proof / Credentials
          </label>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
            className="block w-full mb-4 text-white"
            autoComplete="off"
          />
          {documentFile && (
            <div className="mb-4">
              <img
                src={URL.createObjectURL(documentFile)}
                alt="Document preview"
                className="max-h-48 object-contain rounded border border-gray-300"
              />
            </div>
          )}

          <label className="block text-sm mb-1">License or Registration Number</label>
          <input
            type="text"
            className="block w-full px-4 py-2 mb-4 text-black rounded"
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            placeholder="DL# / EIN / Reg#"
            autoComplete="off"
          />

          <label className="inline-flex items-center mb-4">
            <input
              type="checkbox"
              className="mr-2"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              autoComplete="off"
            />
            <span className="text-sm">
              I agree to the <a href="#" className="underline">verification terms</a>.
            </span>
          </label>
        </>
      ) : (
        <p className="text-white">
          All set! Click below to launch your dashboard and start exploring.
        </p>
      )}

      <button
        onClick={handleContinue}
        disabled={loading}
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded w-full"
      >
        {loading
          ? 'Verifying...'
          : role
          ? `Finish Verification & Launch ${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`
          : 'Finish Verification'}
      </button>
    </div>
  );
}