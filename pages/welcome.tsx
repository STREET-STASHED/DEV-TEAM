import { useRouter } from 'next/router';
import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import supabaseBrowserClient from '@/lib/supabaseBrowserClient';
import styles from '../styles/welcome.module.css';

export default function WelcomePage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  return (
    <div className={styles.container}>
      <h1 className={styles.heroTitle}>
        Welcome to STREETSTASHED
      </h1>
      <p className={styles.heroSubtitle}>
        The future of fashion delivery. Tap in to browse the culture or become part of the movement.
      </p>
      <div className={styles.ctaGroup}>
        <button
          onClick={() => router.push('/buyer/marketplace')}
          className={styles.ctaButtonPrimary}
        >
          🔍 Browse Drops
        </button>
        <button
          onClick={() => router.push('/signup')}
          className={styles.ctaButtonSecondary}
        >
          🚀 Join as Seller, Stylist or Driver
        </button>
      </div>
    </div>
  );
}