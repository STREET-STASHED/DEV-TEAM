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
          Where Style Moves Like You Do.
        </h1>
        <p className={styles.subheading}>
          Fashion delivered on demand. From exclusive drops to everyday heat — all day in every neighborhood.
        </p>
        <div className={styles.buttonGroup}>
          <button
            className={styles.browseButton}
            onClick={() => router.push('/marketplace')}
          >
            Browse Drops
          </button>
          <button
            onClick={handleJoin}
            className={styles.joinButton}
          >
            Join Us
          </button>
        </div>
      </div>
      <div className={styles.backgroundImage} />
    </section>
  );
};

export default Hero;