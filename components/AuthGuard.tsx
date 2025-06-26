import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from "@/lib/supabaseBrowserClient";

export default function AuthGuard({ role, children }: { role: string, children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  // supabase is already initialized from the import

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          console.error('Session error or user not found:', sessionError);
          await router.replace('/welcome');
          return;
        }

        const userId = session.user.id;

        const roleResponse = await fetch(`/api/get-role?id=${userId}`);
        if (!roleResponse.ok) {
          console.error('Error fetching user role:', await roleResponse.text());
          return;
        }

        const roleData = await roleResponse.json();

        if (!roleData || typeof roleData !== 'object') {
          console.error('Malformed role response:', roleData);
          await router.replace('/welcome');
          return;
        }

        if (!roleData.role) {
          await router.replace('/onboarding/role');
          return;
        }

        if (!roleData.details_complete) {
          await router.replace('/onboarding/details');
          return;
        }

        if (!roleData.verified) {
          await router.replace('/onboarding/verify');
          return;
        }

        if (roleData.role !== role) {
          console.warn(`Role mismatch. Expected: ${role}, Got: ${roleData.role}`);
          await router.replace('/not-authorized');
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error('Unexpected error in auth guard:', err);
        await router.replace('/welcome');
      }
    };

    checkAuth();
  }, [role, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Checking authorization...</p>
      </div>
    );
  }
  return <>{children}</>
}