// hooks/useSupabase.js
import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a context for the Supabase client and auth state
const SupabaseContext = createContext(null);

export function SupabaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current session and user
    const getInitialSession = async () => {
      try {
        setLoading(true);
        
        // Check for an existing session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user || null);
          }
        );
        
        return () => {
          subscription?.unsubscribe();
        };
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();
  }, []);

  const value = {
    supabase,
    user,
    session,
    loading,
    signIn: (options) => supabase.auth.signInWithPassword(options),
    signUp: (options) => supabase.auth.signUp(options),
    signOut: () => supabase.auth.signOut(),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email),
    updatePassword: (password) => supabase.auth.updateUser({ password }),
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

// Custom hook to use the Supabase context
export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}