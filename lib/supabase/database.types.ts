export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      analytics_events: {
        Row: {
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_engagement_metrics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      analytics_events_2025_01: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string | null
          ip_address: unknown | null
          properties: Json | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events_2025_02: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string | null
          ip_address: unknown | null
          properties: Json | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events_2025_03: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string | null
          ip_address: unknown | null
          properties: Json | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events_2025_04: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string | null
          ip_address: unknown | null
          properties: Json | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events_2025_05: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string | null
          ip_address: unknown | null
          properties: Json | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events_2025_06: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string | null
          ip_address: unknown | null
          properties: Json | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events_2025_07: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string | null
          ip_address: unknown | null
          properties: Json | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events_2025_08: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string | null
          ip_address: unknown | null
          properties: Json | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events_2025_09: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string | null
          ip_address: unknown | null
          properties: Json | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events_2025_10: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string | null
          ip_address: unknown | null
          properties: Json | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events_2025_11: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string | null
          ip_address: unknown | null
          properties: Json | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events_2025_12: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string | null
          ip_address: unknown | null
          properties: Json | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events_partitioned: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string | null
          ip_address: unknown | null
          properties: Json | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string | null
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ar_interactions: {
        Row: {
          id: string
          interaction_type: string
          metadata: Json | null
          session_id: string
          timestamp: string
        }
        Insert: {
          id?: string
          interaction_type: string
          metadata?: Json | null
          session_id: string
          timestamp?: string
        }
        Update: {
          id?: string
          interaction_type?: string
          metadata?: Json | null
          session_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "ar_interactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ar_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ar_sessions: {
        Row: {
          created_at: string | null
          duration: number | null
          final_result: Json | null
          id: string
          product_id: string
          start_time: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          final_result?: Json | null
          id?: string
          product_id: string
          start_time?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          final_result?: Json | null
          id?: string
          product_id?: string
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ar_sessions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          quantity: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          quantity?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          quantity?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          id: string
          post_id: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          id?: string
          post_id: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          id?: string
          post_id?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "social_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_job_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          drivers_available: number | null
          error_message: string | null
          executed_at: string
          execution_time_ms: number | null
          id: string
          job_name: string
          orders_assigned: number | null
          orders_processed: number | null
          success: boolean
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          drivers_available?: number | null
          error_message?: string | null
          executed_at?: string
          execution_time_ms?: number | null
          id?: string
          job_name: string
          orders_assigned?: number | null
          orders_processed?: number | null
          success: boolean
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          drivers_available?: number | null
          error_message?: string | null
          executed_at?: string
          execution_time_ms?: number | null
          id?: string
          job_name?: string
          orders_assigned?: number | null
          orders_processed?: number | null
          success?: boolean
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          created_at: string | null
          delivery_status: string
          driver_id: string | null
          estimated_delivery: string | null
          id: string
          order_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_status?: string
          driver_id?: string | null
          estimated_delivery?: string | null
          id?: string
          order_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_status?: string
          driver_id?: string | null
          estimated_delivery?: string | null
          id?: string
          order_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "active_orders_view"
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
      disputes: {
        Row: {
          buyer_id: string
          created_at: string | null
          description: string | null
          escalated_at: string | null
          id: string
          order_id: string
          reason: string
          resolution_notes: string | null
          resolved_at: string | null
          seller_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          description?: string | null
          escalated_at?: string | null
          id?: string
          order_id: string
          reason: string
          resolution_notes?: string | null
          resolved_at?: string | null
          seller_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          description?: string | null
          escalated_at?: string | null
          id?: string
          order_id?: string
          reason?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          seller_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "disputes_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "user_engagement_metrics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "active_orders_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "disputes_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_engagement_metrics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      driver_assignments: {
        Row: {
          assigned_at: string
          assignment_method: string | null
          assignment_score: number | null
          created_at: string | null
          delivered_at: string | null
          driver_completion_rate: number | null
          driver_id: string
          driver_rating: number | null
          id: string
          notes: string | null
          order_id: string
          picked_up_at: string | null
        }
        Insert: {
          assigned_at?: string
          assignment_method?: string | null
          assignment_score?: number | null
          created_at?: string | null
          delivered_at?: string | null
          driver_completion_rate?: number | null
          driver_id: string
          driver_rating?: number | null
          id?: string
          notes?: string | null
          order_id: string
          picked_up_at?: string | null
        }
        Update: {
          assigned_at?: string
          assignment_method?: string | null
          assignment_score?: number | null
          created_at?: string | null
          delivered_at?: string | null
          driver_completion_rate?: number | null
          driver_id?: string
          driver_rating?: number | null
          id?: string
          notes?: string | null
          order_id?: string
          picked_up_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_performance_metrics"
            referencedColumns: ["stasher_id"]
          },
          {
            foreignKeyName: "driver_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "active_orders_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_earnings: {
        Row: {
          base_delivery_fee: number
          created_at: string | null
          distance_bonus: number | null
          driver_id: string
          driver_payout: number
          id: string
          order_id: string
          paid_at: string | null
          payment_status: string | null
          platform_fee: number
          time_bonus: number | null
          tip_amount: number | null
          total_earnings: number
        }
        Insert: {
          base_delivery_fee: number
          created_at?: string | null
          distance_bonus?: number | null
          driver_id: string
          driver_payout: number
          id?: string
          order_id: string
          paid_at?: string | null
          payment_status?: string | null
          platform_fee: number
          time_bonus?: number | null
          tip_amount?: number | null
          total_earnings: number
        }
        Update: {
          base_delivery_fee?: number
          created_at?: string | null
          distance_bonus?: number | null
          driver_id?: string
          driver_payout?: number
          id?: string
          order_id?: string
          paid_at?: string | null
          payment_status?: string | null
          platform_fee?: number
          time_bonus?: number | null
          tip_amount?: number | null
          total_earnings?: number
        }
        Relationships: [
          {
            foreignKeyName: "driver_earnings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_performance_metrics"
            referencedColumns: ["stasher_id"]
          },
          {
            foreignKeyName: "driver_earnings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_earnings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "active_orders_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_earnings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_metrics: {
        Row: {
          average_delivery_time: number | null
          created_at: string | null
          customer_rating: number | null
          date: string
          driver_id: string
          id: string
          orders_cancelled: number | null
          orders_completed: number | null
          total_distance: number | null
          total_earnings: number | null
        }
        Insert: {
          average_delivery_time?: number | null
          created_at?: string | null
          customer_rating?: number | null
          date: string
          driver_id: string
          id?: string
          orders_cancelled?: number | null
          orders_completed?: number | null
          total_distance?: number | null
          total_earnings?: number | null
        }
        Update: {
          average_delivery_time?: number | null
          created_at?: string | null
          customer_rating?: number | null
          date?: string
          driver_id?: string
          id?: string
          orders_cancelled?: number | null
          orders_completed?: number | null
          total_distance?: number | null
          total_earnings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_metrics_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_performance_metrics"
            referencedColumns: ["stasher_id"]
          },
          {
            foreignKeyName: "driver_metrics_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_profiles: {
        Row: {
          avatar_url: string | null
          background_check_status: string | null
          completed_orders: number
          created_at: string
          current_location: Json
          current_order_id: string | null
          driver_tier: string | null
          first_name: string
          id: string
          insurance_info: Json | null
          is_available: boolean
          is_online: boolean | null
          last_name: string
          phone: string
          rating: number | null
          total_earnings: number
          updated_at: string
          user_id: string
          vehicle_info: Json
        }
        Insert: {
          avatar_url?: string | null
          background_check_status?: string | null
          completed_orders?: number
          created_at?: string
          current_location?: Json
          current_order_id?: string | null
          driver_tier?: string | null
          first_name: string
          id?: string
          insurance_info?: Json | null
          is_available?: boolean
          is_online?: boolean | null
          last_name: string
          phone: string
          rating?: number | null
          total_earnings?: number
          updated_at?: string
          user_id: string
          vehicle_info?: Json
        }
        Update: {
          avatar_url?: string | null
          background_check_status?: string | null
          completed_orders?: number
          created_at?: string
          current_location?: Json
          current_order_id?: string | null
          driver_tier?: string | null
          first_name?: string
          id?: string
          insurance_info?: Json | null
          is_available?: boolean
          is_online?: boolean | null
          last_name?: string
          phone?: string
          rating?: number | null
          total_earnings?: number
          updated_at?: string
          user_id?: string
          vehicle_info?: Json
        }
        Relationships: []
      }
      driver_schedules: {
        Row: {
          created_at: string | null
          day_of_week: number
          driver_id: string
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          driver_id: string
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          driver_id?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_schedules_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_performance_metrics"
            referencedColumns: ["stasher_id"]
          },
          {
            foreignKeyName: "driver_schedules_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_stats: {
        Row: {
          average_rating: number | null
          cancelled_orders: number
          completed_orders: number
          created_at: string
          driver_id: string
          id: string
          tier: string | null
          total_distance: number
          total_earnings: number
          total_orders: number
          updated_at: string
        }
        Insert: {
          average_rating?: number | null
          cancelled_orders?: number
          completed_orders?: number
          created_at?: string
          driver_id: string
          id?: string
          tier?: string | null
          total_distance?: number
          total_earnings?: number
          total_orders?: number
          updated_at?: string
        }
        Update: {
          average_rating?: number | null
          cancelled_orders?: number
          completed_orders?: number
          created_at?: string
          driver_id?: string
          id?: string
          tier?: string | null
          total_distance?: number
          total_earnings?: number
          total_orders?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_stats_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_performance_metrics"
            referencedColumns: ["stasher_id"]
          },
          {
            foreignKeyName: "driver_stats_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_analytics: {
        Row: {
          created_at: string | null
          date: string
          id: string
          product_id: string | null
          reorder_point: number
          stock_level: number
          turnover_rate: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          product_id?: string | null
          reorder_point: number
          stock_level: number
          turnover_rate?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          product_id?: string | null
          reorder_point?: number
          stock_level?: number
          turnover_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_performance_metrics"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image: string | null
          name: string
          price: number
          product_id: string | null
          seller_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          name: string
          price: number
          product_id?: string | null
          seller_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          price?: number
          product_id?: string | null
          seller_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_performance_metrics"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_engagement_metrics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      maintenance_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          details: Json | null
          error_message: string | null
          id: string
          maintenance_type: string
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          maintenance_type: string
          started_at?: string | null
          status: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          maintenance_type?: string
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      market_intelligence: {
        Row: {
          category: string
          confidence_score: number | null
          created_at: string | null
          id: string
          source: string | null
          trend_data: Json
        }
        Insert: {
          category: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          source?: string | null
          trend_data: Json
        }
        Update: {
          category?: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          source?: string | null
          trend_data?: Json
        }
        Relationships: []
      }
      monitoring_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string | null
          id: string
          message: string
          recommendation: string
          severity: string
          timestamp: string
          type: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string | null
          id: string
          message: string
          recommendation: string
          severity: string
          timestamp: string
          type: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string | null
          id?: string
          message?: string
          recommendation?: string
          severity?: string
          timestamp?: string
          type?: string
        }
        Relationships: []
      }
      monitoring_insights: {
        Row: {
          confidence: number
          id: string
          message: string
          recommendation: string
          severity: string
          timestamp: string | null
          type: string
        }
        Insert: {
          confidence: number
          id?: string
          message: string
          recommendation: string
          severity: string
          timestamp?: string | null
          type: string
        }
        Update: {
          confidence?: number
          id?: string
          message?: string
          recommendation?: string
          severity?: string
          timestamp?: string | null
          type?: string
        }
        Relationships: []
      }
      monitoring_metrics: {
        Row: {
          cpu_usage: number
          created_at: string | null
          endpoint: string
          error_rate: number
          id: string
          memory_usage: number
          response_time: number
          status_code: number
          timestamp: string
          user_count: number
        }
        Insert: {
          cpu_usage: number
          created_at?: string | null
          endpoint: string
          error_rate: number
          id?: string
          memory_usage: number
          response_time: number
          status_code: number
          timestamp: string
          user_count: number
        }
        Update: {
          cpu_usage?: number
          created_at?: string | null
          endpoint?: string
          error_rate?: number
          id?: string
          memory_usage?: number
          response_time?: number
          status_code?: number
          timestamp?: string
          user_count?: number
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          push_notifications: boolean | null
          sms_notifications: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          read_at: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          read_at?: string | null
          title: string
          type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_engagement_metrics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "active_orders_view"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "product_performance_metrics"
            referencedColumns: ["product_id"]
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
      order_status_history: {
        Row: {
          created_at: string | null
          driver_id: string | null
          driver_name: string | null
          driver_phone: string | null
          id: string
          location: string | null
          metadata: Json | null
          notes: string | null
          order_id: string
          status: string
          timestamp: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          notes?: string | null
          order_id: string
          status: string
          timestamp?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          notes?: string | null
          order_id?: string
          status?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_performance_metrics"
            referencedColumns: ["stasher_id"]
          },
          {
            foreignKeyName: "order_status_history_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "active_orders_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_time: string | null
          buyer_id: string
          created_at: string
          delivery_address: Json
          delivery_fee: number | null
          delivery_fee_amount: number | null
          delivery_instructions: string | null
          distance_miles: number
          driver_assigned_at: string | null
          driver_delivered_at: string | null
          driver_id: string | null
          driver_pay: number | null
          driver_payout: number
          driver_payout_amount: number | null
          driver_picked_up_at: string | null
          estimated_delivery_time: string | null
          eta_minutes: number | null
          id: string
          item_total: number
          items: Json
          payment_intent_id: string | null
          payment_status: string | null
          pickup_address: Json
          platform_margin: number
          platform_margin_amount: number | null
          seller_id: string
          status: string
          support_fee_buyer: number | null
          support_fee_seller: number | null
          support_fee_total: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          actual_delivery_time?: string | null
          buyer_id: string
          created_at?: string
          delivery_address: Json
          delivery_fee?: number | null
          delivery_fee_amount?: number | null
          delivery_instructions?: string | null
          distance_miles: number
          driver_assigned_at?: string | null
          driver_delivered_at?: string | null
          driver_id?: string | null
          driver_pay?: number | null
          driver_payout: number
          driver_payout_amount?: number | null
          driver_picked_up_at?: string | null
          estimated_delivery_time?: string | null
          eta_minutes?: number | null
          id?: string
          item_total: number
          items?: Json
          payment_intent_id?: string | null
          payment_status?: string | null
          pickup_address: Json
          platform_margin: number
          platform_margin_amount?: number | null
          seller_id: string
          status?: string
          support_fee_buyer?: number | null
          support_fee_seller?: number | null
          support_fee_total: number
          total_amount: number
          updated_at?: string
        }
        Update: {
          actual_delivery_time?: string | null
          buyer_id?: string
          created_at?: string
          delivery_address?: Json
          delivery_fee?: number | null
          delivery_fee_amount?: number | null
          delivery_instructions?: string | null
          distance_miles?: number
          driver_assigned_at?: string | null
          driver_delivered_at?: string | null
          driver_id?: string | null
          driver_pay?: number | null
          driver_payout?: number
          driver_payout_amount?: number | null
          driver_picked_up_at?: string | null
          estimated_delivery_time?: string | null
          eta_minutes?: number | null
          id?: string
          item_total?: number
          items?: Json
          payment_intent_id?: string | null
          payment_status?: string | null
          pickup_address?: Json
          platform_margin?: number
          platform_margin_amount?: number | null
          seller_id?: string
          status?: string
          support_fee_buyer?: number | null
          support_fee_seller?: number | null
          support_fee_total?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_performance_metrics"
            referencedColumns: ["stasher_id"]
          },
          {
            foreignKeyName: "orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_2025_01: {
        Row: {
          actual_delivery_time: string | null
          buyer_id: string
          created_at: string
          delivery_address: Json
          driver_id: string | null
          driver_payout: number | null
          estimated_delivery_time: string | null
          id: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin: number | null
          seller_id: string
          status: string
          support_fee_total: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          buyer_id: string
          created_at?: string
          delivery_address: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin?: number | null
          seller_id: string
          status?: string
          support_fee_total?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          buyer_id?: string
          created_at?: string
          delivery_address?: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total?: number
          items?: Json
          pickup_address?: Json
          platform_margin?: number | null
          seller_id?: string
          status?: string
          support_fee_total?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      orders_2025_02: {
        Row: {
          actual_delivery_time: string | null
          buyer_id: string
          created_at: string
          delivery_address: Json
          driver_id: string | null
          driver_payout: number | null
          estimated_delivery_time: string | null
          id: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin: number | null
          seller_id: string
          status: string
          support_fee_total: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          buyer_id: string
          created_at?: string
          delivery_address: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin?: number | null
          seller_id: string
          status?: string
          support_fee_total?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          buyer_id?: string
          created_at?: string
          delivery_address?: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total?: number
          items?: Json
          pickup_address?: Json
          platform_margin?: number | null
          seller_id?: string
          status?: string
          support_fee_total?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      orders_2025_03: {
        Row: {
          actual_delivery_time: string | null
          buyer_id: string
          created_at: string
          delivery_address: Json
          driver_id: string | null
          driver_payout: number | null
          estimated_delivery_time: string | null
          id: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin: number | null
          seller_id: string
          status: string
          support_fee_total: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          buyer_id: string
          created_at?: string
          delivery_address: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin?: number | null
          seller_id: string
          status?: string
          support_fee_total?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          buyer_id?: string
          created_at?: string
          delivery_address?: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total?: number
          items?: Json
          pickup_address?: Json
          platform_margin?: number | null
          seller_id?: string
          status?: string
          support_fee_total?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      orders_2025_04: {
        Row: {
          actual_delivery_time: string | null
          buyer_id: string
          created_at: string
          delivery_address: Json
          driver_id: string | null
          driver_payout: number | null
          estimated_delivery_time: string | null
          id: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin: number | null
          seller_id: string
          status: string
          support_fee_total: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          buyer_id: string
          created_at?: string
          delivery_address: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin?: number | null
          seller_id: string
          status?: string
          support_fee_total?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          buyer_id?: string
          created_at?: string
          delivery_address?: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total?: number
          items?: Json
          pickup_address?: Json
          platform_margin?: number | null
          seller_id?: string
          status?: string
          support_fee_total?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      orders_2025_05: {
        Row: {
          actual_delivery_time: string | null
          buyer_id: string
          created_at: string
          delivery_address: Json
          driver_id: string | null
          driver_payout: number | null
          estimated_delivery_time: string | null
          id: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin: number | null
          seller_id: string
          status: string
          support_fee_total: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          buyer_id: string
          created_at?: string
          delivery_address: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin?: number | null
          seller_id: string
          status?: string
          support_fee_total?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          buyer_id?: string
          created_at?: string
          delivery_address?: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total?: number
          items?: Json
          pickup_address?: Json
          platform_margin?: number | null
          seller_id?: string
          status?: string
          support_fee_total?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      orders_2025_06: {
        Row: {
          actual_delivery_time: string | null
          buyer_id: string
          created_at: string
          delivery_address: Json
          driver_id: string | null
          driver_payout: number | null
          estimated_delivery_time: string | null
          id: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin: number | null
          seller_id: string
          status: string
          support_fee_total: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          buyer_id: string
          created_at?: string
          delivery_address: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin?: number | null
          seller_id: string
          status?: string
          support_fee_total?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          buyer_id?: string
          created_at?: string
          delivery_address?: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total?: number
          items?: Json
          pickup_address?: Json
          platform_margin?: number | null
          seller_id?: string
          status?: string
          support_fee_total?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      orders_2025_07: {
        Row: {
          actual_delivery_time: string | null
          buyer_id: string
          created_at: string
          delivery_address: Json
          driver_id: string | null
          driver_payout: number | null
          estimated_delivery_time: string | null
          id: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin: number | null
          seller_id: string
          status: string
          support_fee_total: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          buyer_id: string
          created_at?: string
          delivery_address: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin?: number | null
          seller_id: string
          status?: string
          support_fee_total?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          buyer_id?: string
          created_at?: string
          delivery_address?: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total?: number
          items?: Json
          pickup_address?: Json
          platform_margin?: number | null
          seller_id?: string
          status?: string
          support_fee_total?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      orders_2025_08: {
        Row: {
          actual_delivery_time: string | null
          buyer_id: string
          created_at: string
          delivery_address: Json
          driver_id: string | null
          driver_payout: number | null
          estimated_delivery_time: string | null
          id: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin: number | null
          seller_id: string
          status: string
          support_fee_total: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          buyer_id: string
          created_at?: string
          delivery_address: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin?: number | null
          seller_id: string
          status?: string
          support_fee_total?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          buyer_id?: string
          created_at?: string
          delivery_address?: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total?: number
          items?: Json
          pickup_address?: Json
          platform_margin?: number | null
          seller_id?: string
          status?: string
          support_fee_total?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      orders_2025_09: {
        Row: {
          actual_delivery_time: string | null
          buyer_id: string
          created_at: string
          delivery_address: Json
          driver_id: string | null
          driver_payout: number | null
          estimated_delivery_time: string | null
          id: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin: number | null
          seller_id: string
          status: string
          support_fee_total: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          buyer_id: string
          created_at?: string
          delivery_address: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin?: number | null
          seller_id: string
          status?: string
          support_fee_total?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          buyer_id?: string
          created_at?: string
          delivery_address?: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total?: number
          items?: Json
          pickup_address?: Json
          platform_margin?: number | null
          seller_id?: string
          status?: string
          support_fee_total?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      orders_2025_10: {
        Row: {
          actual_delivery_time: string | null
          buyer_id: string
          created_at: string
          delivery_address: Json
          driver_id: string | null
          driver_payout: number | null
          estimated_delivery_time: string | null
          id: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin: number | null
          seller_id: string
          status: string
          support_fee_total: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          buyer_id: string
          created_at?: string
          delivery_address: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin?: number | null
          seller_id: string
          status?: string
          support_fee_total?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          buyer_id?: string
          created_at?: string
          delivery_address?: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total?: number
          items?: Json
          pickup_address?: Json
          platform_margin?: number | null
          seller_id?: string
          status?: string
          support_fee_total?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      orders_2025_11: {
        Row: {
          actual_delivery_time: string | null
          buyer_id: string
          created_at: string
          delivery_address: Json
          driver_id: string | null
          driver_payout: number | null
          estimated_delivery_time: string | null
          id: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin: number | null
          seller_id: string
          status: string
          support_fee_total: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          buyer_id: string
          created_at?: string
          delivery_address: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin?: number | null
          seller_id: string
          status?: string
          support_fee_total?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          buyer_id?: string
          created_at?: string
          delivery_address?: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total?: number
          items?: Json
          pickup_address?: Json
          platform_margin?: number | null
          seller_id?: string
          status?: string
          support_fee_total?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      orders_2025_12: {
        Row: {
          actual_delivery_time: string | null
          buyer_id: string
          created_at: string
          delivery_address: Json
          driver_id: string | null
          driver_payout: number | null
          estimated_delivery_time: string | null
          id: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin: number | null
          seller_id: string
          status: string
          support_fee_total: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          buyer_id: string
          created_at?: string
          delivery_address: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin?: number | null
          seller_id: string
          status?: string
          support_fee_total?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          buyer_id?: string
          created_at?: string
          delivery_address?: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total?: number
          items?: Json
          pickup_address?: Json
          platform_margin?: number | null
          seller_id?: string
          status?: string
          support_fee_total?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      orders_partitioned: {
        Row: {
          actual_delivery_time: string | null
          buyer_id: string
          created_at: string
          delivery_address: Json
          driver_id: string | null
          driver_payout: number | null
          estimated_delivery_time: string | null
          id: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin: number | null
          seller_id: string
          status: string
          support_fee_total: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          buyer_id: string
          created_at?: string
          delivery_address: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total: number
          items: Json
          pickup_address: Json
          platform_margin?: number | null
          seller_id: string
          status?: string
          support_fee_total?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          buyer_id?: string
          created_at?: string
          delivery_address?: Json
          driver_id?: string | null
          driver_payout?: number | null
          estimated_delivery_time?: string | null
          id?: string
          item_total?: number
          items?: Json
          pickup_address?: Json
          platform_margin?: number | null
          seller_id?: string
          status?: string
          support_fee_total?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_partitioned_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_performance_metrics"
            referencedColumns: ["stasher_id"]
          },
          {
            foreignKeyName: "orders_partitioned_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_trends: {
        Row: {
          avg_error_rate: number
          avg_response_time: number
          created_at: string | null
          date: string
          id: string
          peak_concurrent_users: number
          total_requests: number
          unique_users: number
        }
        Insert: {
          avg_error_rate: number
          avg_response_time: number
          created_at?: string | null
          date: string
          id?: string
          peak_concurrent_users: number
          total_requests: number
          unique_users: number
        }
        Update: {
          avg_error_rate?: number
          avg_response_time?: number
          created_at?: string | null
          date?: string
          id?: string
          peak_concurrent_users?: number
          total_requests?: number
          unique_users?: number
        }
        Relationships: []
      }
      personalization_events: {
        Row: {
          category: string | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          item_id: string | null
          metadata: Json | null
          price: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          item_id?: string | null
          metadata?: Json | null
          price?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          item_id?: string | null
          metadata?: Json | null
          price?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      price_optimizations: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          current_price: number
          id: string
          product_id: string | null
          reasoning: string | null
          suggested_price: number
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          current_price: number
          id?: string
          product_id?: string | null
          reasoning?: string | null
          suggested_price: number
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          current_price?: number
          id?: string
          product_id?: string | null
          reasoning?: string | null
          suggested_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_optimizations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_performance_metrics"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "price_optimizations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_ar_data: {
        Row: {
          ar_model_url: string | null
          colors: Json
          created_at: string | null
          fit_type: string | null
          id: string
          material: string | null
          measurements: Json
          product_id: string
          size_chart: Json
          updated_at: string | null
        }
        Insert: {
          ar_model_url?: string | null
          colors?: Json
          created_at?: string | null
          fit_type?: string | null
          id?: string
          material?: string | null
          measurements?: Json
          product_id: string
          size_chart?: Json
          updated_at?: string | null
        }
        Update: {
          ar_model_url?: string | null
          colors?: Json
          created_at?: string | null
          fit_type?: string | null
          id?: string
          material?: string | null
          measurements?: Json
          product_id?: string
          size_chart?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_ar_data_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      product_features: {
        Row: {
          brand: string | null
          color_palette: string[] | null
          condition: string | null
          created_at: string | null
          fit_type: string | null
          id: string
          last_updated: string | null
          material: string | null
          popularity_score: number | null
          product_id: string
          seasonality: string[] | null
          style_tags: string[] | null
          trend_score: number | null
        }
        Insert: {
          brand?: string | null
          color_palette?: string[] | null
          condition?: string | null
          created_at?: string | null
          fit_type?: string | null
          id?: string
          last_updated?: string | null
          material?: string | null
          popularity_score?: number | null
          product_id: string
          seasonality?: string[] | null
          style_tags?: string[] | null
          trend_score?: number | null
        }
        Update: {
          brand?: string | null
          color_palette?: string[] | null
          condition?: string | null
          created_at?: string | null
          fit_type?: string | null
          id?: string
          last_updated?: string | null
          material?: string | null
          popularity_score?: number | null
          product_id?: string
          seasonality?: string[] | null
          style_tags?: string[] | null
          trend_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_features_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category: string | null
          color: string | null
          condition: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          seller_id: string
          size: string | null
          style: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          color?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          seller_id: string
          size?: string | null
          style?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          color?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          seller_id?: string
          size?: string | null
          style?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          body_measurements: Json | null
          created_at: string
          date_of_birth: string | null
          details_complete: boolean | null
          email: string | null
          favorite_categories: string[] | null
          full_name: string | null
          has_completed_onboarding: boolean | null
          id: string
          is_verified: boolean | null
          onboarding_step: string | null
          phone: string | null
          price_range: Json | null
          referral_code: string | null
          reward_points: number | null
          role: string | null
          size_preferences: Json | null
          style_preferences: Json | null
          username: string | null
          verification_approved_at: string | null
          verification_docs: string[] | null
          verification_rejected_at: string | null
          verification_rejection_reason: string | null
          verification_submitted_at: string | null
        }
        Insert: {
          bio?: string | null
          body_measurements?: Json | null
          created_at?: string
          date_of_birth?: string | null
          details_complete?: boolean | null
          email?: string | null
          favorite_categories?: string[] | null
          full_name?: string | null
          has_completed_onboarding?: boolean | null
          id: string
          is_verified?: boolean | null
          onboarding_step?: string | null
          phone?: string | null
          price_range?: Json | null
          referral_code?: string | null
          reward_points?: number | null
          role?: string | null
          size_preferences?: Json | null
          style_preferences?: Json | null
          username?: string | null
          verification_approved_at?: string | null
          verification_docs?: string[] | null
          verification_rejected_at?: string | null
          verification_rejection_reason?: string | null
          verification_submitted_at?: string | null
        }
        Update: {
          bio?: string | null
          body_measurements?: Json | null
          created_at?: string
          date_of_birth?: string | null
          details_complete?: boolean | null
          email?: string | null
          favorite_categories?: string[] | null
          full_name?: string | null
          has_completed_onboarding?: boolean | null
          id?: string
          is_verified?: boolean | null
          onboarding_step?: string | null
          phone?: string | null
          price_range?: Json | null
          referral_code?: string | null
          reward_points?: number | null
          role?: string | null
          size_preferences?: Json | null
          style_preferences?: Json | null
          username?: string | null
          verification_approved_at?: string | null
          verification_docs?: string[] | null
          verification_rejected_at?: string | null
          verification_rejection_reason?: string | null
          verification_submitted_at?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string | null
          device_type: string | null
          id: string
          token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_type?: string | null
          id?: string
          token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_type?: string | null
          id?: string
          token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      recommendation_cache: {
        Row: {
          confidence_scores: number[] | null
          context: Json | null
          created_at: string | null
          expires_at: string
          id: string
          product_ids: string[]
          reasons: string[] | null
          recommendation_type: string
          scores: number[]
          user_id: string
        }
        Insert: {
          confidence_scores?: number[] | null
          context?: Json | null
          created_at?: string | null
          expires_at: string
          id?: string
          product_ids: string[]
          reasons?: string[] | null
          recommendation_type: string
          scores: number[]
          user_id: string
        }
        Update: {
          confidence_scores?: number[] | null
          context?: Json | null
          created_at?: string | null
          expires_at?: string
          id?: string
          product_ids?: string[]
          reasons?: string[] | null
          recommendation_type?: string
          scores?: number[]
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referred_id: string
          referrer_id: string
          referred_email: string | null
          referrer_email: string | null
          reward_points_awarded: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referred_id: string
          referrer_id: string
          referred_email?: string | null
          referrer_email?: string | null
          reward_points_awarded?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referred_id?: string
          referrer_id?: string
          referred_email?: string | null
          referrer_email?: string | null
          reward_points_awarded?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "user_engagement_metrics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "user_engagement_metrics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sales_analytics: {
        Row: {
          created_at: string | null
          date: string
          id: string
          product_id: string | null
          quantity: number
          revenue: number
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          product_id?: string | null
          quantity: number
          revenue: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          product_id?: string | null
          quantity?: number
          revenue?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_performance_metrics"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "sales_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      social_challenges: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          end_date: string | null
          featured_posts: string[] | null
          hashtag: string | null
          id: string
          participants: number | null
          prize: Json | null
          reward_points: number | null
          rules: string[] | null
          start_date: string | null
          submissions: number | null
          title: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          featured_posts?: string[] | null
          hashtag?: string | null
          id?: string
          participants?: number | null
          prize?: Json | null
          reward_points?: number | null
          rules?: string[] | null
          start_date?: string | null
          submissions?: number | null
          title: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          featured_posts?: string[] | null
          hashtag?: string | null
          id?: string
          participants?: number | null
          prize?: Json | null
          reward_points?: number | null
          rules?: string[] | null
          start_date?: string | null
          submissions?: number | null
          title?: string
        }
        Relationships: []
      }
      social_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes: number | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes?: number | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes?: number | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "social_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_engagement_metrics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      social_interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string
          platform: string | null
          post_id: string
          user_id: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type: string
          platform?: string | null
          post_id: string
          user_id: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string
          platform?: string | null
          post_id?: string
          user_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "social_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_engagement_metrics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      social_posts: {
        Row: {
          comments: number | null
          content: string
          created_at: string | null
          id: string
          images: string[] | null
          is_sponsored: boolean | null
          likes: number | null
          location: string | null
          product_ids: string[] | null
          shares: number | null
          tags: string[] | null
          type: string | null
          updated_at: string | null
          user_id: string
          views: number | null
          viral_score: number | null
        }
        Insert: {
          comments?: number | null
          content: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_sponsored?: boolean | null
          likes?: number | null
          location?: string | null
          product_ids?: string[] | null
          shares?: number | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
          user_id: string
          views?: number | null
          viral_score?: number | null
        }
        Update: {
          comments?: number | null
          content?: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_sponsored?: boolean | null
          likes?: number | null
          location?: string | null
          product_ids?: string[] | null
          shares?: number | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
          views?: number | null
          viral_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "social_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_engagement_metrics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      social_rewards: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          paid_at: string | null
          points: number
          post_id: string | null
          reason: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          paid_at?: string | null
          points: number
          post_id?: string | null
          reason?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          paid_at?: string | null
          points?: number
          post_id?: string | null
          reason?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_rewards_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "social_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_engagement_metrics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      stores: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          name: string
          owner_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name: string
          owner_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          owner_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_health_snapshots: {
        Row: {
          active_connections: number
          cpu_usage: number
          created_at: string | null
          database_connections: number
          disk_usage: number
          id: string
          memory_usage: number
          network_latency: number
          timestamp: string
        }
        Insert: {
          active_connections: number
          cpu_usage: number
          created_at?: string | null
          database_connections: number
          disk_usage: number
          id?: string
          memory_usage: number
          network_latency: number
          timestamp: string
        }
        Update: {
          active_connections?: number
          cpu_usage?: number
          created_at?: string | null
          database_connections?: number
          disk_usage?: number
          id?: string
          memory_usage?: number
          network_latency?: number
          timestamp?: string
        }
        Relationships: []
      }
      trend_analyses: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          growth_rate: number | null
          id: string
          popularity_score: number | null
          trend_name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          growth_rate?: number | null
          id?: string
          popularity_score?: number | null
          trend_name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          growth_rate?: number | null
          id?: string
          popularity_score?: number | null
          trend_name?: string
        }
        Relationships: []
      }
      user_behavior_analytics: {
        Row: {
          actions_performed: Json | null
          device_info: Json | null
          id: string
          page_visited: string
          session_id: string
          time_spent: number
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          actions_performed?: Json | null
          device_info?: Json | null
          id?: string
          page_visited: string
          session_id: string
          time_spent: number
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          actions_performed?: Json | null
          device_info?: Json | null
          id?: string
          page_visited?: string
          session_id?: string
          time_spent?: number
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_behaviors: {
        Row: {
          action: string
          id: string
          metadata: Json | null
          product_id: string
          session_id: string | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          action: string
          id?: string
          metadata?: Json | null
          product_id: string
          session_id?: string | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          action?: string
          id?: string
          metadata?: Json | null
          product_id?: string
          session_id?: string | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_behaviors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_performance_metrics"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "user_behaviors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_behaviors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_behaviors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_behaviors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_engagement_metrics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_measurements: {
        Row: {
          body_type: string | null
          chest: number | null
          created_at: string | null
          height: number | null
          hips: number | null
          id: string
          inseam: number | null
          shoulders: number | null
          updated_at: string | null
          user_id: string
          waist: number | null
          weight: number | null
        }
        Insert: {
          body_type?: string | null
          chest?: number | null
          created_at?: string | null
          height?: number | null
          hips?: number | null
          id?: string
          inseam?: number | null
          shoulders?: number | null
          updated_at?: string | null
          user_id: string
          waist?: number | null
          weight?: number | null
        }
        Update: {
          body_type?: string | null
          chest?: number | null
          created_at?: string | null
          height?: number | null
          hips?: number | null
          id?: string
          inseam?: number | null
          shoulders?: number | null
          updated_at?: string | null
          user_id?: string
          waist?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          brand: string | null
          category: string | null
          confidence: number | null
          created_at: string | null
          id: string
          last_updated: string | null
          price_range_max: number | null
          price_range_min: number | null
          style_tags: string[] | null
          user_id: string
          weight: number | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          style_tags?: string[] | null
          user_id: string
          weight?: number | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          style_tags?: string[] | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      user_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          reviewed_id: string | null
          reviewer_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          reviewed_id?: string | null
          reviewer_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          reviewed_id?: string | null
          reviewer_id?: string | null
        }
        Relationships: []
      }
      user_rewards: {
        Row: {
          created_at: string | null
          id: string
          level: string | null
          points: number
          reward_points: number | null
          total_earned: number
          total_spent: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: string | null
          points?: number
          reward_points?: number | null
          total_earned?: number
          total_spent?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string | null
          points?: number
          reward_points?: number | null
          total_earned?: number
          total_spent?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_social_profiles: {
        Row: {
          avatar: string | null
          bio: string | null
          categories: string[] | null
          created_at: string | null
          display_name: string | null
          followers: number | null
          followers_count: number | null
          following: number | null
          id: string
          is_influencer: boolean | null
          is_verified: boolean | null
          location: string | null
          platform: string
          posts: number | null
          social_links: Json | null
          updated_at: string | null
          user_id: string
          username: string | null
          verified: boolean | null
          viral_score: number | null
          website: string | null
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          categories?: string[] | null
          created_at?: string | null
          display_name?: string | null
          followers?: number | null
          followers_count?: number | null
          following?: number | null
          id?: string
          is_influencer?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          platform: string
          posts?: number | null
          social_links?: Json | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          verified?: boolean | null
          viral_score?: number | null
          website?: string | null
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          categories?: string[] | null
          created_at?: string | null
          display_name?: string | null
          followers?: number | null
          followers_count?: number | null
          following?: number | null
          id?: string
          is_influencer?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          platform?: string
          posts?: number | null
          social_links?: Json | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          verified?: boolean | null
          viral_score?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_social_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_social_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_social_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_engagement_metrics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_style_profiles: {
        Row: {
          brand_preferences: Json | null
          color_preferences: Json | null
          created_at: string | null
          id: string
          size_preferences: Json | null
          style_preferences: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          brand_preferences?: Json | null
          color_preferences?: Json | null
          created_at?: string | null
          id?: string
          size_preferences?: Json | null
          style_preferences?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          brand_preferences?: Json | null
          color_preferences?: Json | null
          created_at?: string | null
          id?: string
          size_preferences?: Json | null
          style_preferences?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      seller_profiles: {
        Row: {
          approval_confidence: number | null
          auto_approved_at: string | null
          business_name: string | null
          business_type: string | null
          created_at: string | null
          experience_years: number | null
          id: string
          specialties: string[] | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
        }
        Insert: {
          approval_confidence?: number | null
          auto_approved_at?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          specialties?: string[] | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
        }
        Update: {
          approval_confidence?: number | null
          auto_approved_at?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      stylist_profiles: {
        Row: {
          approval_confidence: number | null
          auto_approved_at: string | null
          created_at: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          services_offered: string[] | null
          specialties: string[] | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
        }
        Insert: {
          approval_confidence?: number | null
          auto_approved_at?: string | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          services_offered?: string[] | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
        }
        Update: {
          approval_confidence?: number | null
          auto_approved_at?: string | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          services_offered?: string[] | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stylist_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      stasher_profiles: {
        Row: {
          approval_confidence: number | null
          auto_approved_at: string | null
          created_at: string | null
          id: string
          is_available: boolean | null
          is_online: boolean | null
          updated_at: string | null
          user_id: string
          vehicle_type: string | null
          verification_status: string | null
        }
        Insert: {
          approval_confidence?: number | null
          auto_approved_at?: string | null
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          is_online?: boolean | null
          updated_at?: string | null
          user_id: string
          vehicle_type?: string | null
          verification_status?: string | null
        }
        Update: {
          approval_confidence?: number | null
          auto_approved_at?: string | null
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          is_online?: boolean | null
          updated_at?: string | null
          user_id?: string
          vehicle_type?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stasher_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_progress: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          current_level: number | null
          id: string
          last_activity: string | null
          role: string
          streak: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
          xp_to_next_level: number | null
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          current_level?: number | null
          id?: string
          last_activity?: string | null
          role: string
          streak?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
          xp_to_next_level?: number | null
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          current_level?: number | null
          id?: string
          last_activity?: string | null
          role?: string
          streak?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
          xp_to_next_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      achievements: {
        Row: {
          achievement_description: string | null
          achievement_id: string
          achievement_name: string
          category: string | null
          created_at: string | null
          id: string
          max_progress: number | null
          points: number | null
          progress: number | null
          reward_description: string | null
          reward_type: string | null
          reward_value: string | null
          unlocked: boolean | null
          unlocked_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_id: string
          achievement_name: string
          category?: string | null
          created_at?: string | null
          id?: string
          max_progress?: number | null
          points?: number | null
          progress?: number | null
          reward_description?: string | null
          reward_type?: string | null
          reward_value?: string | null
          unlocked?: boolean | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_id?: string
          achievement_name?: string
          category?: string | null
          created_at?: string | null
          id?: string
          max_progress?: number | null
          points?: number | null
          progress?: number | null
          reward_description?: string | null
          reward_type?: string | null
          reward_value?: string | null
          unlocked?: boolean | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      milestones: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          current: number | null
          id: string
          milestone_description: string | null
          milestone_id: string
          milestone_name: string
          reward: string | null
          role: string
          target: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current?: number | null
          id?: string
          milestone_description?: string | null
          milestone_id: string
          milestone_name: string
          reward?: string | null
          role: string
          target: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current?: number | null
          id?: string
          milestone_description?: string | null
          milestone_id?: string
          milestone_name?: string
          reward?: string | null
          role?: string
          target?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reward_claims: {
        Row: {
          claimed_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          reward_id: string
          reward_name: string
          reward_type: string
          reward_value: string
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reward_id: string
          reward_name: string
          reward_type: string
          reward_value: string
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reward_id?: string
          reward_name?: string
          reward_type?: string
          reward_value?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      xp_transactions: {
        Row: {
          action: string
          created_at: string | null
          id: string
          points: number
          reason: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          points: number
          reason?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          points?: number
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      approval_history: {
        Row: {
          approval_time: string | null
          auto_approved: boolean | null
          confidence_score: number | null
          created_at: string | null
          id: string
          restrictions: string[] | null
          risk_score: number | null
          role: string
          user_id: string
          verification_required: string[] | null
        }
        Insert: {
          approval_time?: string | null
          auto_approved?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          restrictions?: string[] | null
          risk_score?: number | null
          role: string
          user_id: string
          verification_required?: string[] | null
        }
        Update: {
          approval_time?: string | null
          auto_approved?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          restrictions?: string[] | null
          risk_score?: number | null
          role?: string
          user_id?: string
          verification_required?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      active_orders_view: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          driver_completion_rate: number | null
          driver_id: string | null
          driver_rating: number | null
          estimated_delivery_time: string | null
          id: string | null
          item_total: number | null
          seller_id: string | null
          status: string | null
          total_amount: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_performance_metrics"
            referencedColumns: ["stasher_id"]
          },
          {
            foreignKeyName: "orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "stasher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_marketplace_stats: {
        Row: {
          active_stashers: number | null
          avg_order_value: number | null
          completed_orders: number | null
          date: string | null
          total_orders: number | null
          total_revenue: number | null
          unique_buyers: number | null
          unique_sellers: number | null
        }
        Relationships: []
      }
      partition_usage_monitor: {
        Row: {
          attname: unknown | null
          correlation: number | null
          n_distinct: number | null
          partition_month: string | null
          partition_type: string | null
          schemaname: unknown | null
          tablename: unknown | null
        }
        Relationships: []
      }
      product_performance_metrics: {
        Row: {
          avg_order_value: number | null
          avg_rating: number | null
          last_ordered_date: string | null
          price: number | null
          product_id: string | null
          product_name: string | null
          seller_id: string | null
          times_ordered: number | null
          total_quantity_sold: number | null
          total_revenue: number | null
          total_reviews: number | null
          unique_buyers: number | null
        }
        Relationships: []
      }
      stasher_performance_metrics: {
        Row: {
          avg_payout_per_delivery: number | null
          completed_deliveries: number | null
          completion_rate: number | null
          current_status: string | null
          last_delivery_date: string | null
          rating: number | null
          stasher_id: string | null
          total_deliveries: number | null
          total_earnings: number | null
          total_orders_assigned: number | null
          total_payouts: number | null
          user_id: string | null
        }
        Relationships: []
      }
      user_activity_summary: {
        Row: {
          completed_orders: number | null
          last_order_date: string | null
          last_social_activity: string | null
          social_interactions: number | null
          social_posts: number | null
          total_orders: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
      user_engagement_metrics: {
        Row: {
          completed_orders: number | null
          engagement_level: string | null
          last_notification_date: string | null
          last_order_date: string | null
          last_social_activity: string | null
          notifications_read: number | null
          notifications_received: number | null
          social_interactions: number | null
          social_posts: number | null
          total_orders: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
      order_history: {
        Row: {
          id: string
          order_id: string
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          status: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      personalized_recommendations: {
        Row: {
          id: string
          user_id: string
          item_id: string
          score: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          score: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          score?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personalized_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personalized_recommendations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Functions: {
      award_referral_points: {
        Args: { p_referred_id: string; p_referrer_id: string }
        Returns: undefined
      }
      calculate_fit_score: {
        Args: { product_measurement: number; user_measurement: number }
        Returns: number
      }
      calculate_order_fees: {
        Args:
          | { order_distance: number; order_total: number }
          | { p_distance_miles: number; p_hour?: number; p_item_total: number }
        Returns: {
          delivery_fee: number
          driver_payout: number
          platform_margin: number
          support_fee_buyer: number
          support_fee_seller: number
        }[]
      }
      calculate_viral_score: {
        Args: {
          p_comments: number
          p_created_at: string
          p_images_count: number
          p_likes: number
          p_products_count: number
          p_shares: number
          p_views: number
        }
        Returns: number
      }
      clean_old_cron_logs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_expired_recommendations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_monitoring_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_monthly_partitions: {
        Args: { target_month: string }
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_data?: Json
          p_message: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
      daily_maintenance_job: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      drop_old_partitions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_ar_analytics: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_cron_job_stats: {
        Args: { days_back?: number; job_name_filter?: string }
        Returns: {
          avg_orders_assigned: number
          failed_executions: number
          job_name: string
          last_execution: string
          success_rate: number
          successful_executions: number
          total_executions: number
        }[]
      }
      get_driver_active_orders: {
        Args: { driver_uuid: string }
        Returns: {
          assigned_at: string
          delivery_address: string
          distance_miles: number
          order_id: string
          pickup_address: string
          status: string
          total_amount: number
        }[]
      }
      get_driver_earnings: {
        Args: { driver_uuid: string; end_date: string; start_date: string }
        Returns: {
          average_per_order: number
          total_distance: number
          total_earnings: number
          total_orders: number
        }[]
      }
      get_fit_recommendations: {
        Args: { p_product_id: string; p_size: string; p_user_id: string }
        Returns: Json
      }
      get_maintenance_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          details: Json
          last_run: string
          maintenance_type: string
          next_scheduled: string
          status: string
        }[]
      }
      get_marketplace_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_stashers: number
          total_orders: number
          total_products: number
          total_revenue: number
          total_users: number
        }[]
      }
      get_orders_ready_for_drivers: {
        Args: Record<PropertyKey, never>
        Returns: {
          buyer_name: string
          created_at: string
          delivery_address: string
          distance_miles: number
          order_id: string
          pickup_address: string
          seller_name: string
          total_amount: number
        }[]
      }
      get_partition_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          last_updated: string
          partition_month: string
          partition_name: string
          partition_type: string
          row_count: number
          table_size: string
        }[]
      }
      get_performance_trends: {
        Args: { days?: number }
        Returns: {
          avg_error_rate: number
          avg_response_time: number
          date: string
          total_requests: number
          unique_users: number
        }[]
      }
      get_similar_users: {
        Args: { limit_count?: number; user_uuid: string }
        Returns: {
          similar_user_id: string
          similarity_score: number
        }[]
      }
      get_system_health_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_users: number
          avg_error_rate: number
          avg_response_time: number
          critical_alerts: number
          system_load: number
          total_alerts: number
          uptime_percentage: number
        }[]
      }
      get_trending_posts: {
        Args: { p_limit?: number }
        Returns: {
          avatar: string
          comments: number
          content: string
          created_at: string
          display_name: string
          id: string
          images: string[]
          likes: number
          product_ids: string[]
          shares: number
          tags: string[]
          type: string
          user_id: string
          username: string
          views: number
          viral_score: number
        }[]
      }
      get_trending_products: {
        Args: { limit_count?: number }
        Returns: {
          product_id: string
          trend_score: number
        }[]
      }
      get_unread_notifications_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_feed: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          avatar: string
          comments: number
          content: string
          created_at: string
          display_name: string
          id: string
          images: string[]
          likes: number
          product_ids: string[]
          shares: number
          tags: string[]
          type: string
          user_id: string
          username: string
          views: number
          viral_score: number
        }[]
      }
      get_user_stats: {
        Args: { user_uuid: string }
        Returns: {
          completed_orders: number
          member_since: string
          social_interactions: number
          social_posts: number
          total_orders: number
          total_spent: number
        }[]
      }
      get_user_top_categories: {
        Args: { limit_count?: number; user_uuid: string }
        Returns: {
          category: string
          interaction_count: number
        }[]
      }
      get_user_viral_metrics: {
        Args: { p_user_id: string }
        Returns: Json
      }
      maintain_partitions: {
        Args: Record<PropertyKey, never>
        Returns: {
          action: string
          message: string
          partition_name: string
          status: string
        }[]
      }
      manage_partitions_automatically: {
        Args: Record<PropertyKey, never>
        Returns: {
          action: string
          message: string
          partition_name: string
          status: string
        }[]
      }
      mark_all_notifications_read: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      monthly_maintenance_job: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_all_materialized_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_materialized_view: {
        Args: { view_name: string }
        Returns: undefined
      }
      refresh_materialized_views_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          error_message: string
          refresh_status: string
          refresh_time: string
          view_name: string
        }[]
      }
      update_post_viral_score: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      update_user_preferences: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      get_user_insights: {
        Args: { p_user_id: string }
        Returns: Json
      }
      analyze_user_behavior: {
        Args: { p_user_id: string }
        Returns: Json
      }
      increment: {
        Args: { row_id: string; column_name: string }
        Returns: number
      }
      create_audit_log_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      delivery_status:
        | "pending"
        | "picked_up"
        | "in_transit"
        | "delivered"
        | "failed"
      dispute_status: "open" | "investigating" | "resolved" | "closed"
      order_status:
        | "pending"
        | "accepted"
        | "en_route"
        | "completed"
        | "cancelled"
      referral_status: "pending" | "completed" | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      delivery_status: [
        "pending",
        "picked_up",
        "in_transit",
        "delivered",
        "failed",
      ],
      dispute_status: ["open", "investigating", "resolved", "closed"],
      order_status: [
        "pending",
        "accepted",
        "en_route",
        "completed",
        "cancelled",
      ],
      referral_status: ["pending", "completed", "expired"],
    },
  },
} as const
