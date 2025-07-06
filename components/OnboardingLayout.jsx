// components/OnboardingLayout.jsx
import { useOnboarding } from '../hooks/useOnboarding';

export default function OnboardingLayout({ children }) {
  const { profile, ONBOARDING_STEPS } = useOnboarding();
  
  // Determine current step for progress indicator
  const getCurrentStepNumber = () => {
    if (!profile) return 1;
    
    switch (profile.onboarding_step) {
      case ONBOARDING_STEPS.ROLE:
        return 2; // Step 2: Role Selection (after signup)
      case ONBOARDING_STEPS.DETAILS:
        return 3; // Step 3: Details
      case ONBOARDING_STEPS.VERIFY:
        return 4; // Step 4: Verification
      default:
        return 1;
    }
  };
  
  const currentStep = getCurrentStepNumber();
  
  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <h1>Complete Your Profile</h1>
        
        {/* Progress indicator */}
        <div className="progress-indicator">
          <div className="steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Signup</div>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Role</div>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Details</div>
            </div>
            <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
              <div className="step-number">4</div>
              <div className="step-label">Verify</div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep - 1) * 33.33}%` }} 
            />
          </div>
        </div>
      </div>
      
      <div className="onboarding-content">
        {children}
      </div>
      
      <div className="onboarding-footer">
        <p>Need help? <a href="/support">Contact Support</a></p>
      </div>
    </div>
  );
}