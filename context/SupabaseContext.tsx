// File: context/SupabaseContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { SupabaseClient, User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

// Create a type for the context value
interface SupabaseContextType {
  supabase: SupabaseClient;
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  // Extended profile data from the 'profiles' table
  profile: any | null;
}

// Create the context
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

// Create a provider component
export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [profile, setProfile] = useState<any | null>(null)
  
  
  useEffect(() => {
    // Get the current session and user on mount
    const getInitialSession = async () => {
      try {
        setLoading(true)
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        
        // Set the user if we have a session
        if (session) {
          setUser(session.user)
          
          // Optionally fetch additional profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          // Merge profile data with user data if needed
          if (profile) {
            setProfile(profile)
            // No need to modify the Supabase user object
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }
    
    getInitialSession()
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, currentSession) => {
        setSession(currentSession)
        
        if (currentSession) {
          setUser(currentSession.user)
          
          // Optionally fetch additional profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single()
            
          // Merge profile data with user data if needed
          if (profile) {
            setProfile(profile)
            // No need to modify the Supabase user object
          }
        } else {
          setUser(null)
        }
      }
    )
    
    // Clean up subscription on unmount
    return () => {
      subscription?.unsubscribe()
    }
  }, [])
  
  // Add authentication methods
  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    })
  }
  
  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password
    })
  }
  
  const signOut = async () => {
    await supabase.auth.signOut()
  }
  
  const value = {
    supabase,
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    profile
  }
  
  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

// Create a hook to use the context
export function useSupabase() {
  const context = useContext(SupabaseContext)
  
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  
  return context
}