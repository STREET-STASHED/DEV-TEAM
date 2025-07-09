import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useSupabase } from '../context/SupabaseContext';
import { useOnboarding } from '../hooks/useOnboarding'; // Import the hook that provides profile data

// Define the role type based on your database enum
type UserRole = 'buyer' | 'seller/brand' | 'stylist' | 'driver';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useSupabase();
  const router = useRouter();
  let userRole: UserRole | undefined = undefined;

  const showOnboardingData = user && router.pathname.startsWith('/onboarding');
  const onboarding = showOnboardingData ? useOnboarding() : null;
  const profile = onboarding?.profile ?? null;
  userRole = profile?.role as UserRole | undefined;

  const hideNav = router.pathname.startsWith('/auth');

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div
      className="app-layout"
      style={{
        backgroundImage: `url('/background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 0,
      }}
    >
      {/* Overlay for better text contrast */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {!hideNav && (
          <header
            className="app-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 2rem',
              color: 'white',
            }}
          >
            <div className="logo" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
              StreetStashed
            </div>

            <div className="user-menu">
              {user ? (
                <>
                  <span style={{ marginRight: '1rem' }}>{user.email}</span>
                  <button onClick={handleSignOut} className="btn-secondary">
                    Sign Out
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                  {userRole === 'stylist' && (
                    <button
                      onClick={() => router.push('/stylist')}
                      style={{
                        backgroundColor: '#000',
                        color: '#FFD700',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        border: '2px solid #FFD700',
                        cursor: 'pointer',
                        margin: '0 0.5rem'
                      }}
                    >
                      ✍️ Stylists
                    </button>
                  )}
                  {userRole === 'seller/brand' && (
                    <button
                      onClick={() => router.push('/dashboard')}
                      style={{
                        backgroundColor: '#000',
                        color: '#FFD700',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        border: '2px solid #FFD700',
                        cursor: 'pointer',
                        margin: '0 0.5rem'
                      }}
                    >
                      📦 Seller Dashboard
                    </button>
                  )}
                  {userRole === 'buyer' && (
                    <button
                      onClick={() => router.push('/marketplace')}
                      style={{
                        backgroundColor: '#000',
                        color: '#FFD700',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        border: '2px solid #FFD700',
                        cursor: 'pointer',
                        margin: '0 0.5rem'
                      }}
                    >
                      🛍️ Start Shopping
                    </button>
                  )}
                  {userRole === 'driver' && (
                    <button
                      onClick={() => router.push('/deliveries')}
                      style={{
                        backgroundColor: '#000',
                        color: '#FFD700',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        border: '2px solid #FFD700',
                        cursor: 'pointer',
                        margin: '0 0.5rem'
                      }}
                    >
                      🚚 Deliveries
                    </button>
                  )}
                  {!userRole && (
                    <>
                      <button
                        onClick={() => router.push('/auth')}
                        style={{
                          backgroundColor: '#000',
                          color: '#FFD700',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          border: '2px solid #FFD700',
                          cursor: 'pointer',
                          margin: '0 0.5rem'
                        }}
                      >
                        🔐 Login / Sign Up
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </header>
        )}

        <main
          className="app-content"
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: hideNav ? 'center' : 'initial',
            alignItems: hideNav ? 'center' : 'initial',
            padding: '2rem',
          }}
        >
          {hideNav ? (
            <div
              className="auth-container"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <div
                className="auth-card"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(10px)',
                  padding: '2rem',
                  borderRadius: '12px',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.1)',
                  width: '100%',
                  maxWidth: '400px',
                  color: '#fff',
                }}
              >
                {children}
              </div>
            </div>
          ) : (
            children
          )}
        </main>

        {!hideNav && (
          <footer
            className="app-footer"
            style={{ textAlign: 'center', padding: '1rem', color: 'white' }}
          >
            <p>&copy; {new Date().getFullYear()} StreetStashed. All rights reserved.</p>
          </footer>
        )}
      </div>
    </div>
  );
}