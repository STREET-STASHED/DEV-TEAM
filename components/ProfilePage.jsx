// components/OnboardingFlow/index.jsx
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useOnboarding } from '../../hooks/useOnboarding';
import RoleSelection from './RoleSelection';
import BrandDetails from './BrandDetails';
import Verification from './Verification';
import OnboardingLayout from './OnboardingLayout';

export default function OnboardingFlow() {
  const { 
    profile, 
    loading, 
    error, 
    navigateToCurrentStep,
    hasCompletedOnboarding,
    ONBOARDING_STEPS
  } = useOnboarding();

  // Redirect to the appropriate step if user tries to access onboarding directly
  useEffect(() => {
    if (!loading && profile) {
      // If onboarding is complete, redirect to dashboard
      if (hasCompletedOnboarding()) {
        navigateToCurrentStep(); // This will navigate to dashboard
      }
    }
  }, [loading, profile]);

  if (loading) {
    return (
      <OnboardingLayout>
        <div className="onboarding-loader">
          <p>Loading your profile...</p>
          {/* Add your spinner/loader component here */}
        </div>
      </OnboardingLayout>
    );
  }

  if (error) {
    return (
      <OnboardingLayout>
        <div className="onboarding-error">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </OnboardingLayout>
    );
  }

  // If user is not logged in, redirect to signup
  if (!profile) {
    return <Navigate to="/auth/Auth" replace />;
  }

  // If onboarding is complete, redirect to dashboard
  if (hasCompletedOnboarding()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route path="role" element={<RoleSelection />} />
      <Route path="details" element={<BrandDetails />} />
      <Route path="verify" element={<Verification />} />
      <Route path="*" element={<Navigate to="role" replace />} />
    </Routes>
  );
}