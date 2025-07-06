

/**
 * Helper type for JSON values
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

/**
 * Database schema types for Supabase
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: string;
          onboarding_step: string | null;
          details_complete: boolean | null;
          has_completed_onboarding: boolean | null;
          verification_submitted_at: string | null;
          business_license_url: string | null;
          brand_logo_url: string | null;
          additional_document_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name?: string;
          role?: string;
          onboarding_step?: string | null;
          details_complete?: boolean | null;
          has_completed_onboarding?: boolean | null;
          verification_submitted_at?: string | null;
          business_license_url?: string | null;
          brand_logo_url?: string | null;
          additional_document_url?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: string;
          onboarding_step?: string | null;
          details_complete?: boolean | null;
          has_completed_onboarding?: boolean | null;
          verification_submitted_at?: string | null;
          business_license_url?: string | null;
          brand_logo_url?: string | null;
          additional_document_url?: string | null;
          updated_at?: string;
        };
      };
      // Add other tables if needed
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

// Ensure this file is treated as a module
export {};