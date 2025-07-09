// src/pages/auth/ResetPassword.tsx
import { useState, FormEvent, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useSupabase } from '../../hooks/useSupabase';
import { AuthError } from '@supabase/supabase-js';

export default function ResetPassword() {
  const { resetPassword } = useSupabase();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    try {
      setLoading(true);
      
      const { error } = await resetPassword(email);
      
      if (error) throw error;
      
      setSuccess(true);
      setEmail(''); // Clear the form
    } catch (error) {
      console.error('Error resetting password:', error);
      setError((error as AuthError).message || 'An error occurred while sending the password reset email');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Your Password</h2>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            Password reset email sent! Check your inbox for further instructions.
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              disabled={loading || success}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary full-width"
            disabled={loading || success}
          >
            {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Remember your password? <Link to="/auth">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}