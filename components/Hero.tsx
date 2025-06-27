import type { Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseBrowserClient';
import { useRouter } from 'next/router';
import styles from './Hero.module.css';

const Hero = () => {
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(
      ({ data }: { data: { session: Session | null } }) => {
        setSession(data.session);
      }
    );
  }, []);

  // Begin multi-step onboarding flow: signup → role → details → verify → dashboard
  const handleJoin = () => {
    router.push('/signup');
  };

  return (
    <section className={styles.heroSection}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.heading}>
          Welcome to StreetStashed
        </h1>
        <p className={styles.subheading}>
          The future of fashion delivery. Tap in to browse the culture or become a seller, stylist or driver.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', zIndex: 2, position: 'relative' }}>
          <Link href="/signup">
            <button style={{ padding: '0.75rem 1.5rem', backgroundColor: '#FFD700', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Join Now
            </button>
          </Link>
          <Link href="/marketplace">
            <button style={{ padding: '0.75rem 1.5rem', backgroundColor: '#000', color: '#FFF', fontWeight: 'bold', border: '2px solid #FFD700', borderRadius: '8px', cursor: 'pointer' }}>
              Browse Marketplace
            </button>
          </Link>
        </div>
      </div>
      <div className={styles.backgroundImage} />
    </section>
  );
};

export default Hero;