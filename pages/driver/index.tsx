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
        router.replace('/onboarding/role');
      } else if (user?.role === 'driver') {
        if (user?.has_completed_onboarding) {
          router.replace('/driver/dashboard');
        } else {
          router.replace('/onboarding/verify');
        }
      } else {
        router.replace('/unauthorized');
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [user, loading]);

  return (
    <div className="flex items-center justify-center min-h-screen text-lg">
      Checking access...
    </div>
  );
}