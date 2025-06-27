import type { Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
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

  return (
    <section className={styles.heroSection}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.heading}>
          Welcome to StreetStashed
        </h1>
        <p className={styles.subheading}>
          The future of fashion delivery. Tap in to browse the culture or become a seller, stylist or driver.
        </p>
        <div className={styles.buttonGroup}>
          <Link href="/signup">
            <button className={styles.joinButton}>Join Now</button>
          </Link>
          <Link href="/marketplace">
            <button className={styles.browseButton}>Browse Marketplace</button>
          </Link>
        </div>
      </div>
      <div className={styles.backgroundImage} />
    </section>
  );
};

export default Hero;