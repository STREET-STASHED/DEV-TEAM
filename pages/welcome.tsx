import { useRouter } from 'next/router';
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
          zIndex: 999,
          position: 'relative',
        }}
      >
        <button
          onClick={() => router.push('/buyer/marketplace')}
          className={`${styles.ctaButtonPrimary} ${styles.ctaButton}`}
        >
          🔍 Browse Drops
        </button>
        <button
          onClick={() => router.push('/signup')}
          className={`${styles.ctaButtonSecondary} ${styles.ctaButton}`}
        >
          🚀 Join as Seller, Stylist or Driver
        </button>
      </div>
    </div>
  );
}