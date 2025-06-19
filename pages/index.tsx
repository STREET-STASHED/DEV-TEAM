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
      // no user → go to login
      router.replace('/login');
    } else {
      // route by role
      if (role === 'buyer') router.replace('/buyer/marketplace');
      else if (role === 'seller') router.replace('/seller/dashboard');
      else if (role === 'driver') router.replace('/driver/dashboard');
      else if (role === 'stylist') router.replace('/stylist/dashboard');
      else router.replace('/login');
    }
  }, [role, loading, router]);

  return null;
}
