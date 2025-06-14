import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/lib/useUser';

export default function DriverIndex() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
    } else if (user.role === 'driver') {
      router.replace('/driver/dashboard');
    } else {
      router.replace('/unauthorized');
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-lg">
      Checking access...
    </div>
  );
}