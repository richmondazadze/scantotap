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
      card_types: {
        Row: {
          id: string
          name: string
          description: string | null
          is_available: boolean
          has_stock_limit: boolean
          stock_quantity: number | null
          price_modifier: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_available?: boolean
          has_stock_limit?: boolean
          stock_quantity?: number | null
          price_modifier: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_available?: boolean
          has_stock_limit?: boolean
          stock_quantity?: number | null
          price_modifier?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      color_schemes: {
        Row: {
          id: string
          name: string
          description: string | null
          primary_color: string
          secondary_color: string | null
          accent_color: string | null
          is_available: boolean
          has_stock_limit: boolean
          stock_quantity: number | null
          price_modifier: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          primary_color: string
          secondary_color?: string | null
          accent_color?: string | null
          is_available?: boolean
          has_stock_limit?: boolean
          stock_quantity?: number | null
          price_modifier: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          primary_color?: string
          secondary_color?: string | null
          accent_color?: string | null
          is_available?: boolean
          has_stock_limit?: boolean
          stock_quantity?: number | null
          price_modifier?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          id: string
          name: string
          description: string | null
          is_available: boolean
          has_stock_limit: boolean
          stock_quantity: number | null
          price_modifier: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_available?: boolean
          has_stock_limit?: boolean
          stock_quantity?: number | null
          price_modifier: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_available?: boolean
          has_stock_limit?: boolean
          stock_quantity?: number | null
          price_modifier?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_shipments: {
        Row: {
          carrier_id: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_instructions: string | null
          delivery_location: string | null
          dimensions: Json | null
          id: string
          items_included: Json | null
          notes: string | null
          order_id: string
          picked_up_at: string | null
          pickup_location: string | null
          shipment_number: string
          shipped_at: string | null
          shipping_cost: number | null
          status: string | null
          tracking_number: string | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          carrier_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_instructions?: string | null
          delivery_location?: string | null
          dimensions?: Json | null
          id?: string
          items_included?: Json | null
          notes?: string | null
          order_id: string
          picked_up_at?: string | null
          pickup_location?: string | null
          shipment_number: string
          shipped_at?: string | null
          shipping_cost?: number | null
          status?: string | null
          tracking_number?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          carrier_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_instructions?: string | null
          delivery_location?: string | null
          dimensions?: Json | null
          id?: string
          items_included?: Json | null
          notes?: string | null
          order_id?: string
          picked_up_at?: string | null
          pickup_location?: string | null
          shipment_number?: string
          shipped_at?: string | null
          shipping_cost?: number | null
          status?: string | null
          tracking_number?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_shipments_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "shipping_carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_tracking_summary"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_date: string | null
          carrier_id: string | null
          color_primary: string
          color_scheme_id: string
          color_scheme_name: string
          color_secondary: string
          created_at: string
          currency: string | null
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          customer_phone: string | null
          delivered_at: string | null
          design_id: string
          design_name: string
          design_price: number
          estimated_delivery_date: string | null
          id: string
          is_priority: boolean | null
          material_id: string
          material_name: string
          material_price_modifier: number | null
          order_number: string
          quantity: number
          requires_signature: boolean | null
          shipped_at: string | null
          shipping: number | null
          shipping_address: string
          shipping_city: string
          shipping_country: string | null
          shipping_notes: string | null
          shipping_state: string
          shipping_zip_code: string
          shipping_zone_id: string | null
          special_instructions: string | null
          status: string | null
          subtotal: number
          tax: number | null
          total: number
          tracking_events: Json | null
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_delivery_date?: string | null
          carrier_id?: string | null
          color_primary: string
          color_scheme_id: string
          color_scheme_name: string
          color_secondary: string
          created_at?: string
          currency?: string | null
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          customer_phone?: string | null
          delivered_at?: string | null
          design_id: string
          design_name: string
          design_price: number
          estimated_delivery_date?: string | null
          id?: string
          is_priority?: boolean | null
          material_id: string
          material_name: string
          material_price_modifier?: number | null
          order_number: string
          quantity: number
          requires_signature?: boolean | null
          shipped_at?: string | null
          shipping?: number | null
          shipping_address: string
          shipping_city: string
          shipping_country?: string | null
          shipping_notes?: string | null
          shipping_state: string
          shipping_zip_code: string
          shipping_zone_id?: string | null
          special_instructions?: string | null
          status?: string | null
          subtotal: number
          tax?: number | null
          total: number
          tracking_events?: Json | null
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_delivery_date?: string | null
          carrier_id?: string | null
          color_primary?: string
          color_scheme_id?: string
          color_scheme_name?: string
          color_secondary?: string
          created_at?: string
          currency?: string | null
          customer_email?: string
          customer_first_name?: string
          customer_last_name?: string
          customer_phone?: string | null
          delivered_at?: string | null
          design_id?: string
          design_name?: string
          design_price?: number
          estimated_delivery_date?: string | null
          id?: string
          is_priority?: boolean | null
          material_id?: string
          material_name?: string
          material_price_modifier?: number | null
          order_number?: string
          quantity?: number
          requires_signature?: boolean | null
          shipped_at?: string | null
          shipping?: number | null
          shipping_address?: string
          shipping_city?: string
          shipping_country?: string | null
          shipping_notes?: string | null
          shipping_state?: string
          shipping_zip_code?: string
          shipping_zone_id?: string | null
          special_instructions?: string | null
          status?: string | null
          subtotal?: number
          tax?: number | null
          total?: number
          tracking_events?: Json | null
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          id: string
          links: Json | null
          name: string
          onboarding_complete: boolean
          phone: string | null
          plan_type: string | null
          slug: string | null
          social_layout_style: string | null
          subscription_expires_at: string | null
          subscription_started_at: string | null
          subscription_status: string | null
          title: string | null
          updated_at: string
          user_id: string
          show_email: boolean | null
          show_phone: boolean | null
          show_whatsapp: boolean | null
          paystack_customer_code: string | null
          paystack_subscription_code: string | null
          email_order_updates: boolean
          email_marketing: boolean
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id: string
          links?: Json | null
          name: string
          onboarding_complete?: boolean
          phone?: string | null
          plan_type?: string | null
          slug?: string | null
          social_layout_style?: string | null
          subscription_expires_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          show_email?: boolean | null
          show_phone?: boolean | null
          show_whatsapp?: boolean | null
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          email_order_updates?: boolean
          email_marketing?: boolean
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          links?: Json | null
          name?: string
          onboarding_complete?: boolean
          phone?: string | null
          plan_type?: string | null
          slug?: string | null
          social_layout_style?: string | null
          subscription_expires_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          show_email?: boolean | null
          show_phone?: boolean | null
          show_whatsapp?: boolean | null
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          email_order_updates?: boolean
          email_marketing?: boolean
        }
        Relationships: []
      }
      shipping_carriers: {
        Row: {
          api_endpoint: string | null
          code: string
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone_number: string | null
          tracking_url_template: string | null
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          code: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone_number?: string | null
          tracking_url_template?: string | null
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          code?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone_number?: string | null
          tracking_url_template?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shipping_rates: {
        Row: {
          base_rate: number
          carrier_id: string
          created_at: string | null
          dimension_height_max: number | null
          dimension_length_max: number | null
          dimension_width_max: number | null
          fuel_surcharge_percent: number | null
          id: string
          is_active: boolean | null
          rate_per_kg: number | null
          service_type: string
          shipping_zone_id: string
          updated_at: string | null
          weight_max: number | null
          weight_min: number | null
        }
        Insert: {
          base_rate: number
          carrier_id: string
          created_at?: string | null
          dimension_height_max?: number | null
          dimension_length_max?: number | null
          dimension_width_max?: number | null
          fuel_surcharge_percent?: number | null
          id?: string
          is_active?: boolean | null
          rate_per_kg?: number | null
          service_type: string
          shipping_zone_id: string
          updated_at?: string | null
          weight_max?: number | null
          weight_min?: number | null
        }
        Update: {
          base_rate?: number
          carrier_id?: string
          created_at?: string | null
          dimension_height_max?: number | null
          dimension_length_max?: number | null
          dimension_width_max?: number | null
          fuel_surcharge_percent?: number | null
          id?: string
          is_active?: boolean | null
          rate_per_kg?: number | null
          service_type?: string
          shipping_zone_id?: string
          updated_at?: string | null
          weight_max?: number | null
          weight_min?: number | null
        }
        Relationships: []
      }
      shipping_zones: {
        Row: {
          base_rate: number | null
          countries: string[] | null
          created_at: string | null
          description: string | null
          estimated_delivery_days_max: number | null
          estimated_delivery_days_min: number | null
          free_shipping_threshold: number | null
          id: string
          is_active: boolean | null
          name: string
          rate_per_item: number | null
          regions: string[] | null
          updated_at: string | null
        }
        Insert: {
          base_rate?: number | null
          countries?: string[] | null
          created_at?: string | null
          description?: string | null
          estimated_delivery_days_max?: number | null
          estimated_delivery_days_min?: number | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          rate_per_item?: number | null
          regions?: string[] | null
          updated_at?: string | null
        }
        Update: {
          base_rate?: number | null
          countries?: string[] | null
          created_at?: string | null
          description?: string | null
          estimated_delivery_days_max?: number | null
          estimated_delivery_days_min?: number | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          rate_per_item?: number | null
          regions?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tracking_events: {
        Row: {
          carrier_event_id: string | null
          created_at: string | null
          description: string | null
          event_timestamp: string
          event_type: string
          id: string
          location: string | null
          notes: string | null
          order_id: string
          status: string
        }
        Insert: {
          carrier_event_id?: string | null
          created_at?: string | null
          description?: string | null
          event_timestamp: string
          event_type: string
          id?: string
          location?: string | null
          notes?: string | null
          order_id: string
          status: string
        }
        Update: {
          carrier_event_id?: string | null
          created_at?: string | null
          description?: string | null
          event_timestamp?: string
          event_type?: string
          id?: string
          location?: string | null
          notes?: string | null
          order_id?: string
          status?: string
        }
        Relationships: []
      }

    }
    Views: {
      order_tracking_summary: {
        Row: {
          carrier_code: string | null
          carrier_name: string | null
          carrier_phone: string | null
          currency: string | null
          delivered_at: string | null
          delivered_shipments: number | null
          delivery_category: string | null
          estimated_delivery_days_max: number | null
          estimated_delivery_days_min: number | null
          order_id: string | null
          order_number: string | null
          order_status: string | null
          shipment_count: number | null
          shipped_at: string | null
          shipping_zone: string | null
          tracking_number: string | null
          tracking_url_template: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_shipping_cost_ghana: {
        Args: {
          p_shipping_country: string
          p_total_amount: number
          p_shipping_region?: string
          p_weight?: number
          p_service_type?: string
          p_currency?: string
        }
        Returns: number
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_ghana_region_from_city: {
        Args: { city_name: string }
        Returns: string
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