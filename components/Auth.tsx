// components/Auth.tsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router"; // For Next.js
// For React Router: import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const router = useRouter(); // For Next.js
  // For React Router: const navigate = useNavigate()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"sign-in" | "sign-up">("sign-in");

  // Email validation
  const validateEmail = (email: string): boolean => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    // At least 6 characters
    return password.length >= 6;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      // Validate email
      if (!validateEmail(email)) {
        throw new Error("Please enter a valid email address");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.session) {
        // Redirect to dashboard directly
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Error signing in:", error);
      setError(error.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      // Validate email
      if (!validateEmail(email)) {
        throw new Error("Please enter a valid email address");
      }

      // Validate password
      if (!validatePassword(password)) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Trim the email to remove any whitespace
      const trimmedEmail = email.trim();

      const { error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          // Don't include redirectTo if you're having issues
          // emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });

      if (error) throw error;

      setMessage("Success! Please check your email for the confirmation link.");
      setView("sign-in");
    } catch (error: any) {
      console.error("Error signing up:", error);
      setError(error.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      // Validate email
      if (!validateEmail(email)) {
        throw new Error("Please enter a valid email address");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        },
      );

      if (error) throw error;

      setMessage("Check your email for the password reset link!");
    } catch (error: any) {
      console.error("Error resetting password:", error);
      setError(error.message || "An error occurred during password reset");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (
    provider: "google" | "github" | "facebook",
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error(`Error signing in with ${provider}:`, error);
      setError(error.message || `An error occurred during ${provider} sign in`);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1>{view === "sign-in" ? "Sign In" : "Create Account"}</h1>

        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">{error}</div>}

        <form onSubmit={view === "sign-in" ? handleSignIn : handleSignUp}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
            {view === "sign-up" && (
              <small className="password-hint">
                Password must be at least 6 characters long
              </small>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="button primary" disabled={loading}>
              {loading
                ? "Loading..."
                : view === "sign-in"
                  ? "Sign In"
                  : "Sign Up"}
            </button>
          </div>
        </form>

        {view === "sign-in" && (
          <div className="auth-links">
            <button
              className="link"
              onClick={handlePasswordReset}
              disabled={loading || !email}
            >
              Forgot your password?
            </button>
            <p>
              Don't have an account?{" "}
              <button className="link" onClick={() => setView("sign-up")}>
                Sign up
              </button>
            </p>
          </div>
        )}

        {view === "sign-up" && (
          <div className="auth-links">
            <p>
              Already have an account?{" "}
              <button className="link" onClick={() => setView("sign-in")}>
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Social auth providers */}
      <div className="social-auth">
        <p>Or continue with</p>
        <div className="social-buttons">
          <button
            onClick={() => handleOAuthSignIn("google")}
            className="social-button google"
            disabled={loading}
          >
            Google
          </button>
          <button
            onClick={() => handleOAuthSignIn("github")}
            className="social-button github"
            disabled={loading}
          >
            GitHub
          </button>
          {/* Add more social providers as needed */}
        </div>
      </div>
    </div>
  );
}
