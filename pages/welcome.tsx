import { useRouter } from 'next/router';
import supabaseBrowserClient from '@/lib/supabaseBrowserClient';
import styles from '../styles/welcome.module.css';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <h1 className={styles.heroTitle}>
        Welcome to STREETSTASHED
      </h1>
      <p className={styles.heroSubtitle}>
        The future of fashion delivery. Tap in to browse the culture or become part of the movement.
      </p>
      <div
        className={styles.ctaGroup}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '2rem',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => router.push('/buyer/marketplace')}
          className={styles.ctaButtonPrimary}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#FFD700',
            color: '#000',
            borderRadius: '0.5rem',
            border: 'none',
          }}
        >
          🔍 Browse Drops
        </button>
        <button
          onClick={() => router.push('/signup')}
          className={styles.ctaButtonSecondary}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: 'transparent',
            color: '#FFD700',
            border: '2px solid #FFD700',
            borderRadius: '0.5rem',
          }}
        >
          🚀 Join as Seller, Stylist or Driver
        </button>
      </div>
    </div>
  );
}