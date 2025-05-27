export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_offices: {
        Row: {
          address: string
          city: string
          created_at: string
          email: string
          hours: string
          id: string
          is_active: boolean
          map_url: string
          phone: string
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          email: string
          hours: string
          id?: string
          is_active?: boolean
          map_url: string
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          email?: string
          hours?: string
          id?: string
          is_active?: boolean
          map_url?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_settings_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          pass_key: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          pass_key: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          pass_key?: string
        }
        Relationships: []
      }
      booking_settings: {
        Row: {
          booking_fee: number
          created_at: string
          id: string
          tax_rate: number
          updated_at: string
        }
        Insert: {
          booking_fee?: number
          created_at?: string
          id?: string
          tax_rate?: number
          updated_at?: string
        }
        Update: {
          booking_fee?: number
          created_at?: string
          id?: string
          tax_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          arrival_time: string
          created_at: string
          departure_date: string
          departure_time: string
          from_location: string
          id: string
          price: number
          route_id: string
          seat_numbers: string[]
          status: string
          to_location: string
          updated_at: string
          user_id: string
        }
        Insert: {
          arrival_time: string
          created_at?: string
          departure_date: string
          departure_time: string
          from_location: string
          id?: string
          price: number
          route_id: string
          seat_numbers: string[]
          status?: string
          to_location: string
          updated_at?: string
          user_id: string
        }
        Update: {
          arrival_time?: string
          created_at?: string
          departure_date?: string
          departure_time?: string
          from_location?: string
          id?: string
          price?: number
          route_id?: string
          seat_numbers?: string[]
          status?: string
          to_location?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      driver_assignments: {
        Row: {
          assignment_date: string
          bus_id: string | null
          created_at: string
          driver_id: string
          id: string
          route_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assignment_date?: string
          bus_id?: string | null
          created_at?: string
          driver_id: string
          id?: string
          route_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assignment_date?: string
          bus_id?: string | null
          created_at?: string
          driver_id?: string
          id?: string
          route_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_assignments_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "fleet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_assignments_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_auth: {
        Row: {
          created_at: string
          driver_id: string
          email: string
          id: string
          last_login: string | null
          pass_key: string
        }
        Insert: {
          created_at?: string
          driver_id: string
          email: string
          id?: string
          last_login?: string | null
          pass_key: string
        }
        Update: {
          created_at?: string
          driver_id?: string
          email?: string
          id?: string
          last_login?: string | null
          pass_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_auth_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string
          experience_years: number | null
          full_name: string
          hire_date: string
          id: string
          license_number: string
          phone: string | null
          rating: number | null
          status: string
          total_trips: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email: string
          experience_years?: number | null
          full_name: string
          hire_date?: string
          id?: string
          license_number: string
          phone?: string | null
          rating?: number | null
          status?: string
          total_trips?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string
          experience_years?: number | null
          full_name?: string
          hire_date?: string
          id?: string
          license_number?: string
          phone?: string | null
          rating?: number | null
          status?: string
          total_trips?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      fleet: {
        Row: {
          capacity: number
          created_at: string
          description: string
          features: string[]
          id: string
          image_url: string
          name: string
          updated_at: string
        }
        Insert: {
          capacity: number
          created_at?: string
          description: string
          features: string[]
          id?: string
          image_url: string
          name: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          description?: string
          features?: string[]
          id?: string
          image_url?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_type: string
          sender_id: string | null
          sender_type: string
          subject: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_type: string
          sender_id?: string | null
          sender_type: string
          subject: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_type?: string
          sender_id?: string | null
          sender_type?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          booking_count: number | null
          created_at: string
          full_name: string | null
          id: string
          is_online: boolean | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          booking_count?: number | null
          created_at?: string
          full_name?: string | null
          id: string
          is_online?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          booking_count?: number | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_online?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean
          rating: number
          review_text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean
          rating: number
          review_text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean
          rating?: number
          review_text?: string
          user_id?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          created_at: string
          departure_times: string[]
          duration: string
          from_location: string
          id: string
          is_popular: boolean | null
          price: number
          to_location: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          departure_times: string[]
          duration: string
          from_location: string
          id?: string
          is_popular?: boolean | null
          price: number
          to_location: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          departure_times?: string[]
          duration?: string
          from_location?: string
          id?: string
          is_popular?: boolean | null
          price?: number
          to_location?: string
          updated_at?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          available_seats: number
          bus_id: string | null
          created_at: string
          departure_date: string
          departure_time: string
          driver_id: string | null
          id: string
          route_id: string
          updated_at: string
        }
        Insert: {
          available_seats?: number
          bus_id?: string | null
          created_at?: string
          departure_date: string
          departure_time: string
          driver_id?: string | null
          id?: string
          route_id: string
          updated_at?: string
        }
        Update: {
          available_seats?: number
          bus_id?: string | null
          created_at?: string
          departure_date?: string
          departure_time?: string
          driver_id?: string | null
          id?: string
          route_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "fleet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_admin_activity: {
        Args: {
          action_type: string
          description: string
          admin_email: string
          entity_type: string
          entity_id: string
        }
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
  public: {
    Enums: {},
  },
} as const
