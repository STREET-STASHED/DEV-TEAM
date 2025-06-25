import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';

export default function VerifyStep() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [license, setLicense] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      if (!error && data?.role) setRole(data.role);
    };
    fetchRole();
  }, []);

  useEffect(() => {
    const checkVerified = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('verified, role')
        .eq('id', user.id)
        .single();

      if (error) return;
      if (data?.verified) {
        const redirectMap: Record<string, string> = {
          buyer: '/buyer/marketplace',
          seller: '/seller/dashboard',
          stylist: '/stylist/dashboard',
          driver: '/driver/dashboard',
        };
        router.push(redirectMap[data.role] || '/');
      }
    };

    checkVerified();
  }, []);

  const handleContinue = async () => {
    try {
      setLoading(true);
      if (!userId || !role) {
        alert('User information is incomplete.');
        setLoading(false);
        return;
      }

      if (['driver', 'seller', 'stylist'].includes(role)) {
        if (!fullName || !dob || !license || !documentFile || !agreed) {
          alert('Please fill in all verification fields and agree to the terms.');
          setLoading(false);
          return;
        }

        const fileExt = documentFile.name.split('.').pop();
        const filePath = `${role}-docs/${userId}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('verification-docs')
          .upload(filePath, documentFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          alert('Failed to upload document.');
          console.error(uploadError);
          setLoading(false);
          return;
        }

        const { error: updateError } = await supabase
          .from('users')
          .update({
            verified: true,
            full_name: fullName,
            dob,
            license_number: license,
            verification_file: filePath,
          })
          .eq('id', userId);

        if (updateError) {
          console.error(updateError);
          alert('Verification failed.');
          setLoading(false);
          return;
        }
      }

      const redirectMap: Record<string, string> = {
        buyer: '/buyer/marketplace',
        seller: '/seller/dashboard',
        stylist: '/stylist/dashboard',
        driver: '/driver/dashboard',
      };

      router.push(redirectMap[role] || '/');
    } catch (err) {
      console.error('Unexpected error in verification:', err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 bg-black text-white shadow rounded-lg">
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
          />

          <label className="block text-sm mb-1">Date of Birth</label>
          <input
            type="date"
            className="block w-full px-4 py-2 mb-4 text-black rounded"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />

          <label className="block text-sm mb-1">
            Upload License / Store Proof / Credentials
          </label>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
            className="block w-full mb-4 text-white"
          />

          <label className="block text-sm mb-1">License or Registration Number</label>
          <input
            type="text"
            className="block w-full px-4 py-2 mb-4 text-black rounded"
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            placeholder="DL# / EIN / Reg#"
          />

          <label className="inline-flex items-center mb-4">
            <input
              type="checkbox"
              className="mr-2"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
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
        {loading ? 'Verifying...' : 'Go to Dashboard'}
      </button>
    </div>
  );
}