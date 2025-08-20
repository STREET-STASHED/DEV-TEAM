'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: "buyer" | "seller" | "driver" | "admin";
  verification_status: "pending" | "approved" | "rejected";
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  // Seller-specific fields
  business_name?: string;
  business_address?: string;
  stripe_account_id?: string;
  // Driver-specific fields
  vehicle_info?: string;
  license_number?: string;
  // Admin-specific fields
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: Profile["role"] | null;
  isVerified: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  isDriver: boolean;
  isBuyer: boolean;

  // Auth methods
  signIn: (_email: string, _password: string) => Promise<{ error?: string }>;
  signUp: (
    _email: string,
    _password: string,
    _profile: Partial<Profile>,
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (_email: string) => Promise<{ error?: string }>;

  // Profile methods
  updateProfile: (_updates: Partial<Profile>) => Promise<{ error?: string }>;
  uploadAvatar: (_file: File) => Promise<{ error?: string; url?: string }>;

  // Role-based access control
  requireAuth: (_requiredRole?: Profile["role"]) => boolean;
  requireVerification: () => boolean;

  // Session management
  refreshSession: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user profile from database
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await loadProfile(initialSession.user.id);
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            await loadProfile(session.user.id);
          } else {
            setProfile(null);
          }

          setIsLoading(false);
        });

        setIsLoading(false);
        return () => subscription.unsubscribe();
      } catch {
        console.error("Error initializing auth");
        setIsLoading(false);
      }
    };

    void initializeAuth();
  }, [loadProfile]);

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch {
      return { error: "An unexpected error occurred" };
    }
  };

  // Sign up
  const signUp = async (
    email: string,
    password: string,
    profileData: Partial<Profile>,
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: profileData,
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Create profile in database
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            email: data.user.email!,
            full_name: profileData.full_name || "",
            role: profileData.role || "buyer",
            verification_status: "pending",
            ...profileData,
          },
        ]);

        if (profileError) {
          console.error("Error creating profile:", profileError);
          return { error: "Failed to create user profile" };
        }
      }

      return {};
    } catch {
      return { error: "An unexpected error occurred" };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      await router.push("/");
    } catch (_error) {
      console.error("Error signing out:", _error);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch {
      return { error: "An unexpected error occurred" };
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: "User not authenticated" };

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) {
        return { error: error.message };
      }

      // Update local state
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      return {};
    } catch {
      return { error: "An unexpected error occurred" };
    }
  };

  // Upload avatar
  const uploadAvatar = async (file: File) => {
    if (!user) return { error: "User not authenticated" };

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        return { error: uploadError.message };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl });

      return { url: publicUrl };
    } catch {
      return { error: "Failed to upload avatar" };
    }
  };

  // Refresh session
  const refreshSession = async () => {
    try {
      const {
        data: { session: newSession },
        error,
      } = await supabase.auth.refreshSession();

      if (error) {
        console.error("Error refreshing session:", error);
        return;
      }

      setSession(newSession);
      setUser(newSession?.user ?? null);
    } catch {
      console.error("Error refreshing session");
    }
  };

  // Get access token
  const getAccessToken = () => {
    return session?.access_token || null;
  };

  // Role-based access control
  const requireAuth = (requiredRole?: Profile["role"]) => {
    if (!isAuthenticated) return false;
    if (!requiredRole) return true;
    return userRole === requiredRole;
  };

  const requireVerification = () => {
    return isAuthenticated && isVerified;
  };

  // Computed values
  const isAuthenticated = !!user && !!profile;
  const userRole = profile?.role || null;
  const isVerified = profile?.verification_status === "approved";
  const isAdmin = userRole === "admin";
  const isSeller = userRole === "seller";
  const isDriver = userRole === "driver";
  const isBuyer = userRole === "buyer";

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated,
    userRole,
    isVerified,
    isAdmin,
    isSeller,
    isDriver,
    isBuyer,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    uploadAvatar,
    requireAuth,
    requireVerification,
    refreshSession,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Higher-order component for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: Profile["role"],
) => {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, userRole, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4">
              Please sign in to access this page.
            </p>
            <button
              onClick={() => void router.push("/login")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Sign In
            </button>
          </div>
        </div>
      );
    }

    if (requiredRole && userRole !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don&apos;t have permission to access this page.
            </p>
            <button
              onClick={() => void router.push("/dashboard")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};
