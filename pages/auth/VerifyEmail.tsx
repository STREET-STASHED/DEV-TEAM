// src/pages/auth/VerifyEmail.tsx
import { useLocation, Link } from 'react-router-dom';

export default function VerifyEmail() {
  const location = useLocation();
  const email = location.state?.email || 'your email';
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Your Email</h2>
        <p>
          We've sent a verification email to <strong>{email}</strong>.
        </p>
        <p>
          Please check your inbox and click the verification link to complete your registration.
        </p>
        <p>
          If you don't see the email, check your spam folder or try signing in again.
        </p>
        
        <div className="auth-footer">
          <p>
            <Link to="/auth" className="btn-secondary full-width">
              Return to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}