// pages/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProfile } from '../hooks/useProfile';

export default function Home() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const role = profile?.role;

  useEffect(() => {
    if (loading) return;  // wait for user & profile fetch
    if (!role) {
      router.replace('/login');
    } else {
      if (role === 'buyer') router.replace('/buyer/marketplace');
      else if (role === 'seller' || role === 'driver' || role === 'stylist') router.replace('/onboarding');
      else router.replace('/login');
    }
  }, [role, loading, router]);

  return null;
}
