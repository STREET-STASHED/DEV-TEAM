export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  public: {
    Tables: {
      cart_items: {
        Row: {
          category: string | null;
          created_at: string | null;
          delivery_tier: string | null;
          id: string;
          image: string | null;
          name: string;
          price: number;
          quantity: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string | null;
          delivery_tier?: string | null;
          id: string;
          image?: string | null;
          name: string;
          price: number;
          quantity: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          category?: string | null;
          created_at?: string | null;
          delivery_tier?: string | null;
          id?: string;
          image?: string | null;
          name?: string;
          price?: number;
          quantity?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      deliveries: {
        Row: {
          created_at: string | null;
          driver_id: string | null;
          dropoff_location: string | null;
          id: string;
          order_id: string | null;
          status: string | null;
        };
        Insert: {
          created_at?: string | null;
          driver_id?: string | null;
          dropoff_location?: string | null;
          id?: string;
          order_id?: string | null;
          status?: string | null;
        };
        Update: {
          created_at?: string | null;
          driver_id?: string | null;
          dropoff_location?: string | null;
          id?: string;
          order_id?: string | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "deliveries_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          created_at: string | null;
          file_url: string | null;
          filename: string | null;
          id: number;
        };
        Insert: {
          created_at?: string | null;
          file_url?: string | null;
          filename?: string | null;
          id?: number;
        };
        Update: {
          created_at?: string | null;
          file_url?: string | null;
          filename?: string | null;
          id?: number;
        };
        Relationships: [];
      };
      driver_locations: {
        Row: {
          driver_id: string;
          latitude: number;
          longitude: number;
          order_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          driver_id: string;
          latitude: number;
          longitude: number;
          order_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          driver_id?: string;
          latitude?: number;
          longitude?: number;
          order_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "driver_locations_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      driver_stats: {
        Row: {
          completed_orders: number;
          driver_id: string;
          tier: string;
          updated_at: string;
        };
        Insert: {
          completed_orders?: number;
          driver_id: string;
          tier?: string;
          updated_at?: string;
        };
        Update: {
          completed_orders?: number;
          driver_id?: string;
          tier?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string | null;
          id: string;
          order_id: string | null;
          product_id: string | null;
          quantity: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          order_id?: string | null;
          product_id?: string | null;
          quantity?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          order_id?: string | null;
          product_id?: string | null;
          quantity?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      order_tracking: {
        Row: {
          current_location: Json | null;
          driver_id: string;
          id: string;
          notes: string | null;
          order_id: string;
          status: string;
          tracking_timestamp: string | null;
        };
        Insert: {
          current_location?: Json | null;
          driver_id: string;
          id?: string;
          notes?: string | null;
          order_id: string;
          status: string;
          tracking_timestamp?: string | null;
        };
        Update: {
          current_location?: Json | null;
          driver_id?: string;
          id?: string;
          notes?: string | null;
          order_id?: string;
          status?: string;
          tracking_timestamp?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_tracking_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          address: string | null;
          buyer_id: string | null;
          city: string | null;
          created_at: string | null;
          driver_id: string | null;
          dropoff_lat: number | null;
          dropoff_lng: number | null;
          email: string | null;
          id: string;
          items: Json | null;
          name: string | null;
          pickup_lat: number | null;
          pickup_lng: number | null;
          seller_id: string | null;
          status: string | null;
          total: number | null;
          total_amount: number | null;
          updated_at: string | null;
        };
        Insert: {
          address?: string | null;
          buyer_id?: string | null;
          city?: string | null;
          created_at?: string | null;
          driver_id?: string | null;
          dropoff_lat?: number | null;
          dropoff_lng?: number | null;
          email?: string | null;
          id?: string;
          items?: Json | null;
          name?: string | null;
          pickup_lat?: number | null;
          pickup_lng?: number | null;
          seller_id?: string | null;
          status?: string | null;
          total?: number | null;
          total_amount?: number | null;
          updated_at?: string | null;
        };
        Update: {
          address?: string | null;
          buyer_id?: string | null;
          city?: string | null;
          created_at?: string | null;
          driver_id?: string | null;
          dropoff_lat?: number | null;
          dropoff_lng?: number | null;
          email?: string | null;
          id?: string;
          items?: Json | null;
          name?: string | null;
          pickup_lat?: number | null;
          pickup_lng?: number | null;
          seller_id?: string | null;
          status?: string | null;
          total?: number | null;
          total_amount?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          created_at: string | null;
          delivery_tier: string | null;
          delivery_tier_int: number | null;
          description: string | null;
          id: string;
          image_url: string | null;
          name: string;
          price: number;
          seller_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          delivery_tier?: string | null;
          delivery_tier_int?: number | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          price: number;
          seller_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          delivery_tier?: string | null;
          delivery_tier_int?: number | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          price?: number;
          seller_id?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string | null;
          details_complete: boolean | null;
          email: string;
          full_name: string;
          has_completed_onboarding: boolean | null;
          is_active: boolean | null;
          onboarding_step: string | null;
          role: string;
          subscription_tier: string | null;
          updated_at: string | null;
          user_id: string;
          username: string | null;
          verification_status: string | null;
          verified: boolean | null;
        };
        Insert: {
          created_at?: string | null;
          details_complete?: boolean | null;
          email: string;
          full_name: string;
          has_completed_onboarding?: boolean | null;
          is_active?: boolean | null;
          onboarding_step?: string | null;
          role: string;
          subscription_tier?: string | null;
          updated_at?: string | null;
          user_id: string;
          username?: string | null;
          verification_status?: string | null;
          verified?: boolean | null;
        };
        Update: {
          created_at?: string | null;
          details_complete?: boolean | null;
          email?: string;
          full_name?: string;
          has_completed_onboarding?: boolean | null;
          is_active?: boolean | null;
          onboarding_step?: string | null;
          role?: string;
          subscription_tier?: string | null;
          updated_at?: string | null;
          user_id?: string;
          username?: string | null;
          verification_status?: string | null;
          verified?: boolean | null;
        };
        Relationships: [];
      };
      verification_documents: {
        Row: {
          created_at: string | null;
          document_type: string;
          document_url: string;
          id: string;
          notes: string | null;
          status: string;
          submitted_at: string | null;
          updated_at: string | null;
          user_id: string;
          verified_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          document_type: string;
          document_url: string;
          id?: string;
          notes?: string | null;
          status?: string;
          submitted_at?: string | null;
          updated_at?: string | null;
          user_id: string;
          verified_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          document_type?: string;
          document_url?: string;
          id?: string;
          notes?: string | null;
          status?: string;
          submitted_at?: string | null;
          updated_at?: string | null;
          user_id?: string;
          verified_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      product_delivery_tiers: {
        Row: {
          tier_id: number | null;
          tier_name: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      accept_order: {
        Args: { driver: string; order_id: string };
        Returns: undefined;
      };
      add_updated_at_column: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      admin_verify_user: {
        Args: {
          p_admin_notes?: string;
          p_is_approved: boolean;
          p_user_id: string;
        };
        Returns: Json;
      };
      calculate_driver_payout: {
        Args: { distance: number };
        Returns: number;
      };
      calculate_driver_tier: {
        Args: { driver_id: string };
        Returns: undefined;
      };
      calculate_seller_payout: {
        Args:
          | {
              product_price: number;
              seller_tier: Database["public"]["Enums"]["subscription_tier_enum"];
            }
          | { product_price: number; seller_tier: string };
        Returns: number;
      };
      calculate_stylist_payout: {
        Args: { booking_price: number; stylist_tier: string };
        Returns: number;
      };
      get_onboarding_status: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      submit_verification_documents: {
        Args:
          | { document_types: string[]; document_urls: string[] }
          | {
              p_document_type: string;
              p_document_url: string;
              p_notes?: string;
            };
        Returns: Json;
      };
      update_onboarding_profile: {
        Args: { additional_details?: Json; full_name_input: string };
        Returns: Json;
      };
      update_onboarding_status: {
        Args: {
          p_details_complete?: boolean;
          p_has_completed_onboarding?: boolean;
          p_onboarding_step?: string;
          p_user_id: string;
        };
        Returns: undefined;
      };
      update_profile_details: {
        Args: { additional_details?: Json; full_name_input: string };
        Returns: Json;
      };
      update_user_role: {
        Args:
          | {
              p_new_role: Database["public"]["Enums"]["user_role"];
              p_user_id: string;
            }
          | { role_name: string };
        Returns: Json;
      };
      verify_user: {
        Args: {
          admin_notes?: string;
          is_approved: boolean;
          user_id_input: string;
        };
        Returns: Json;
      };
      verify_user_profile: {
        Args: { p_user_id: string; p_verified?: boolean };
        Returns: undefined;
      };
    };
    Enums: {
      delivery_tier_type: "local" | "citywide" | "extended";
      order_status: "pending_driver" | "assigned" | "picked_up" | "delivered";
      stylist_tier_enum: "Silver" | "Gold" | "Diamond Elite";
      subscription_tier_enum:
        | "Non-Subscriber"
        | "Silver"
        | "Gold"
        | "Platinum"
        | "Diamond Elite";
      user_role:
        | "buyer"
        | "seller"
        | "admin"
        | "seller/brand"
        | "stylist"
        | "driver";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      delivery_tier_type: ["local", "citywide", "extended"],
      order_status: ["pending_driver", "assigned", "picked_up", "delivered"],
      stylist_tier_enum: ["Silver", "Gold", "Diamond Elite"],
      subscription_tier_enum: [
        "Non-Subscriber",
        "Silver",
        "Gold",
        "Platinum",
        "Diamond Elite",
      ],
      user_role: [
        "buyer",
        "seller",
        "admin",
        "seller/brand",
        "stylist",
        "driver",
      ],
    },
  },
} as const;
