// lib/supabase/database.types.ts
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'buyer' | 'seller' | 'admin' | 'driver' | 'stylist'
          full_name?: string
          has_completed_onboarding: boolean
          details_complete: boolean
          verified: boolean
          onboarding_step: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'buyer' | 'seller' | 'admin' | 'driver' | 'stylist'
          full_name?: string
          has_completed_onboarding?: boolean
          details_complete?: boolean
          verified?: boolean
          onboarding_step?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
    }
  }
}