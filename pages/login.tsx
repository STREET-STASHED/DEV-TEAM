import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding'); // Direct access to onboarding for now
  }, [router]);

  return null;
}
