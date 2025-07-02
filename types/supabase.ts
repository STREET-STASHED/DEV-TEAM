export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          client_id: string | null
          created_at: string | null
          date: string
          description: string | null
          id: string
          status: string | null
          stylist_id: string | null
          time_slot: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          status?: string | null
          stylist_id?: string | null
          time_slot?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          status?: string | null
          stylist_id?: string | null
          time_slot?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          destination: string | null
          driver_id: string | null
          id: string
          order_id: string | null
          pay_estimate: number | null
          pickup_location: string | null
          scheduled_time: string | null
          status: string | null
        }
        Insert: {
          destination?: string | null
          driver_id?: string | null
          id?: string
          order_id?: string | null
          pay_estimate?: number | null
          pickup_location?: string | null
          scheduled_time?: string | null
          status?: string | null
        }
        Update: {
          destination?: string | null
          driver_id?: string | null
          id?: string
          order_id?: string | null
          pay_estimate?: number | null
          pickup_location?: string | null
          scheduled_time?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string | null
          current_lat: number | null
          current_lng: number | null
          delivery_radius: number | null
          id: string
          is_online: boolean | null
          license_number: string | null
          payout_method: string | null
          user_id: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          delivery_radius?: number | null
          id?: string
          is_online?: boolean | null
          license_number?: string | null
          payout_method?: string | null
          user_id?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          delivery_radius?: number | null
          id?: string
          is_online?: boolean | null
          license_number?: string | null
          payout_method?: string | null
          user_id?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          price: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          id?: string
          order_id?: string | null
          price: number
          product_id?: string | null
          quantity: number
        }
        Update: {
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string | null
          commission_amount: number | null
          created_at: string | null
          customer_type: string | null
          delivery_address: string | null
          delivery_fee: number | null
          guest_id: string | null
          id: string
          is_guest: boolean | null
          product_id: string
          seller_id: string | null
          status: string | null
          support_fee: number | null
          total: number | null
          total_price: number | null
        }
        Insert: {
          buyer_id?: string | null
          commission_amount?: number | null
          created_at?: string | null
          customer_type?: string | null
          delivery_address?: string | null
          delivery_fee?: number | null
          guest_id?: string | null
          id?: string
          is_guest?: boolean | null
          product_id: string
          seller_id?: string | null
          status?: string | null
          support_fee?: number | null
          total?: number | null
          total_price?: number | null
        }
        Update: {
          buyer_id?: string | null
          commission_amount?: number | null
          created_at?: string | null
          customer_type?: string | null
          delivery_address?: string | null
          delivery_fee?: number | null
          guest_id?: string | null
          id?: string
          is_guest?: boolean | null
          product_id?: string
          seller_id?: string | null
          status?: string | null
          support_fee?: number | null
          total?: number | null
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payout_method: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payout_method?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payout_method?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          seller_id: string | null
          stock: number | null
          storefront_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          seller_id?: string | null
          stock?: number | null
          storefront_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          seller_id?: string | null
          stock?: number | null
          storefront_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_storefront_id_fkey"
            columns: ["storefront_id"]
            isOneToOne: false
            referencedRelation: "storefronts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
        }
        Relationships: []
      }
      sellers: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          payout_method: string | null
          store_description: string | null
          store_name: string | null
          subscription_tier: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          payout_method?: string | null
          store_description?: string | null
          store_name?: string | null
          subscription_tier?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          payout_method?: string | null
          store_description?: string | null
          store_name?: string | null
          subscription_tier?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sellers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      storefronts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          name: string
          owner_id: string | null
          payout_method: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name: string
          owner_id?: string | null
          payout_method?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          owner_id?: string | null
          payout_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storefronts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stylist_applications: {
        Row: {
          bio: string | null
          booking_link: string | null
          bundles: string | null
          city: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          instagram: string | null
          phone: string | null
          portfolio_url: string | null
          specialties: string | null
          specialty: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          booking_link?: string | null
          bundles?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          instagram?: string | null
          phone?: string | null
          portfolio_url?: string | null
          specialties?: string | null
          specialty?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          booking_link?: string | null
          bundles?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          instagram?: string | null
          phone?: string | null
          portfolio_url?: string | null
          specialties?: string | null
          specialty?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stylists: {
        Row: {
          bio: string | null
          booking_link: string | null
          created_at: string | null
          id: string
          instagram: string | null
          payout_method: string | null
          specialty: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          booking_link?: string | null
          created_at?: string | null
          id?: string
          instagram?: string | null
          payout_method?: string | null
          specialty?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          booking_link?: string | null
          created_at?: string | null
          id?: string
          instagram?: string | null
          payout_method?: string | null
          specialty?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stylists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          details_complete: boolean | null
          dummy_patch: boolean | null
          email: string
          full_name: string | null
          has_completed_onboarding: boolean | null
          id: string
          is_active: boolean | null
          license_number: string | null
          name: string | null
          onboarded: boolean | null
          payout_method: string | null
          phone: string | null
          portfolio: string | null
          profile_image_url: string | null
          referral_code: string | null
          role: string | null
          specialties: string | null
          store_description: string | null
          store_name: string | null
          updated_at: string | null
          vehicle_type: string | null
          verification_complete: boolean | null
          verification_url: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          details_complete?: boolean | null
          dummy_patch?: boolean | null
          email: string
          full_name?: string | null
          has_completed_onboarding?: boolean | null
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          name?: string | null
          onboarded?: boolean | null
          payout_method?: string | null
          phone?: string | null
          portfolio?: string | null
          profile_image_url?: string | null
          referral_code?: string | null
          role?: string | null
          specialties?: string | null
          store_description?: string | null
          store_name?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
          verification_complete?: boolean | null
          verification_url?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          details_complete?: boolean | null
          dummy_patch?: boolean | null
          email?: string
          full_name?: string | null
          has_completed_onboarding?: boolean | null
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          name?: string | null
          onboarded?: boolean | null
          payout_method?: string | null
          phone?: string | null
          portfolio?: string | null
          profile_image_url?: string | null
          referral_code?: string | null
          role?: string | null
          specialties?: string | null
          store_description?: string | null
          store_name?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
          verification_complete?: boolean | null
          verification_url?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_delivery_on_order: {
        Args:
          | Record<PropertyKey, never>
          | { order_id: number; delivery_address: string }
          | { order_id: string }
          | {
              order_id: string
              driver_id?: string
              status?: string
              destination?: string
              pickup_location?: string
              scheduled_time?: string
            }
        Returns: undefined
      }
      create_role_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

