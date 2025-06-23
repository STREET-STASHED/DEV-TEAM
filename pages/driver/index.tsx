import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/lib/useUser';

export default function DriverIndex() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;

    const timeout = setTimeout(() => {
      if (!user) {
        router.replace('/onboarding');
      } else if (user?.role === 'driver') {
        router.replace('/driver/dashboard');
      } else {
        router.replace('/unauthorized');
      }
    }, 100); // slight delay to ensure auth loads properly

    return () => clearTimeout(timeout);
  }, [user, loading]);

  return (
    <div className="flex items-center justify-center min-h-screen text-lg">
      Checking access...
    </div>
  );
}