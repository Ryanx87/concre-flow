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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          registration_number: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          registration_number?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          registration_number?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          arrival_time: string | null
          created_at: string
          current_latitude: number | null
          current_longitude: number | null
          dispatch_time: string | null
          driver_name: string | null
          driver_phone: string | null
          eta_minutes: number | null
          id: string
          order_id: string
          status: string | null
          truck_number: string | null
          updated_at: string
        }
        Insert: {
          arrival_time?: string | null
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          dispatch_time?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          eta_minutes?: number | null
          id?: string
          order_id: string
          status?: string | null
          truck_number?: string | null
          updated_at?: string
        }
        Update: {
          arrival_time?: string | null
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          dispatch_time?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          eta_minutes?: number | null
          id?: string
          order_id?: string
          status?: string | null
          truck_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          order_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          order_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          order_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          company_id: string
          concrete_grade: Database["public"]["Enums"]["concrete_grade"]
          created_at: string
          delivery_date: string
          delivery_time: string | null
          estimated_price: number | null
          id: string
          number_of_trucks: number
          order_number: string
          site_id: string
          slump: number | null
          special_instructions: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          structure_id: string | null
          updated_at: string
          volume: number
        }
        Insert: {
          company_id: string
          concrete_grade: Database["public"]["Enums"]["concrete_grade"]
          created_at?: string
          delivery_date: string
          delivery_time?: string | null
          estimated_price?: number | null
          id?: string
          number_of_trucks: number
          order_number: string
          site_id: string
          slump?: number | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          structure_id?: string | null
          updated_at?: string
          volume: number
        }
        Update: {
          company_id?: string
          concrete_grade?: Database["public"]["Enums"]["concrete_grade"]
          created_at?: string
          delivery_date?: string
          delivery_time?: string | null
          estimated_price?: number | null
          id?: string
          number_of_trucks?: number
          order_number?: string
          site_id?: string
          slump?: number | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          structure_id?: string | null
          updated_at?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          address: string
          company_id: string
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          updated_at: string
        }
        Insert: {
          address: string
          company_id: string
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          address?: string
          company_id?: string
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      structures: {
        Row: {
          additives: Json | null
          aggregate_size: number | null
          concrete_grade: Database["public"]["Enums"]["concrete_grade"]
          created_at: string
          id: string
          name: string
          pour_sequence: number | null
          site_id: string
          slump: number | null
          status: string | null
          type: Database["public"]["Enums"]["structure_type"]
          updated_at: string
          volume: number
        }
        Insert: {
          additives?: Json | null
          aggregate_size?: number | null
          concrete_grade: Database["public"]["Enums"]["concrete_grade"]
          created_at?: string
          id?: string
          name: string
          pour_sequence?: number | null
          site_id: string
          slump?: number | null
          status?: string | null
          type: Database["public"]["Enums"]["structure_type"]
          updated_at?: string
          volume: number
        }
        Update: {
          additives?: Json | null
          aggregate_size?: number | null
          concrete_grade?: Database["public"]["Enums"]["concrete_grade"]
          created_at?: string
          id?: string
          name?: string
          pour_sequence?: number | null
          site_id?: string
          slump?: number | null
          status?: string | null
          type?: Database["public"]["Enums"]["structure_type"]
          updated_at?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "structures_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "user"
      concrete_grade: "20MPa" | "25MPa" | "30MPa" | "40MPa" | "50MPa"
      notification_type:
        | "order_confirmed"
        | "truck_dispatched"
        | "delivery_approaching"
        | "delivery_arrived"
        | "delivery_completed"
        | "status_changed"
      order_status:
        | "placed"
        | "confirmed"
        | "in-production"
        | "dispatched"
        | "in-transit"
        | "delivered"
        | "completed"
        | "cancelled"
      structure_type:
        | "foundation"
        | "column"
        | "beam"
        | "slab"
        | "wall"
        | "staircase"
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
  public: {
    Enums: {
      app_role: ["admin", "manager", "user"],
      concrete_grade: ["20MPa", "25MPa", "30MPa", "40MPa", "50MPa"],
      notification_type: [
        "order_confirmed",
        "truck_dispatched",
        "delivery_approaching",
        "delivery_arrived",
        "delivery_completed",
        "status_changed",
      ],
      order_status: [
        "placed",
        "confirmed",
        "in-production",
        "dispatched",
        "in-transit",
        "delivered",
        "completed",
        "cancelled",
      ],
      structure_type: [
        "foundation",
        "column",
        "beam",
        "slab",
        "wall",
        "staircase",
      ],
    },
  },
} as const
