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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          store_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          store_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          store_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      filament_purchases: {
        Row: {
          brand: string | null
          created_at: string
          filament_id: string
          id: string
          notes: string | null
          price_paid: number | null
          purchase_date: string | null
          quantity_grams: number
          supplier: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string
          filament_id: string
          id?: string
          notes?: string | null
          price_paid?: number | null
          purchase_date?: string | null
          quantity_grams: number
          supplier?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string
          filament_id?: string
          id?: string
          notes?: string | null
          price_paid?: number | null
          purchase_date?: string | null
          quantity_grams?: number
          supplier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "filament_purchases_filament_id_fkey"
            columns: ["filament_id"]
            isOneToOne: false
            referencedRelation: "filaments"
            referencedColumns: ["id"]
          },
        ]
      }
      filaments: {
        Row: {
          brand: string | null
          color: string
          created_at: string
          id: string
          last_purchase_date: string | null
          material: string
          name: string
          notes: string | null
          price_per_kg: number
          quantity_grams: number
          store_id: string
          supplier: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          color: string
          created_at?: string
          id?: string
          last_purchase_date?: string | null
          material: string
          name: string
          notes?: string | null
          price_per_kg?: number
          quantity_grams?: number
          store_id: string
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          color?: string
          created_at?: string
          id?: string
          last_purchase_date?: string | null
          material?: string
          name?: string
          notes?: string | null
          price_per_kg?: number
          quantity_grams?: number
          store_id?: string
          supplier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "filaments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          color_selected: string | null
          customization_text: string | null
          id: string
          notes: string | null
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          color_selected?: string | null
          customization_text?: string | null
          id?: string
          notes?: string | null
          order_id: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Update: {
          color_selected?: string | null
          customization_text?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
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
          created_at: string
          customer_id: string | null
          filament_id: string | null
          id: string
          packaging_id: string | null
          payment_status: string | null
          printer_id: string | null
          production_notes: string | null
          production_status: string | null
          store_id: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          filament_id?: string | null
          id?: string
          packaging_id?: string | null
          payment_status?: string | null
          printer_id?: string | null
          production_notes?: string | null
          production_status?: string | null
          store_id: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          filament_id?: string | null
          id?: string
          packaging_id?: string | null
          payment_status?: string | null
          printer_id?: string | null
          production_notes?: string | null
          production_status?: string | null
          store_id?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "store_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_filament_id_fkey"
            columns: ["filament_id"]
            isOneToOne: false
            referencedRelation: "filaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_packaging_id_fkey"
            columns: ["packaging_id"]
            isOneToOne: false
            referencedRelation: "packaging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_printer_id_fkey"
            columns: ["printer_id"]
            isOneToOne: false
            referencedRelation: "printers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      packaging: {
        Row: {
          cost: number | null
          created_at: string
          dimensions: string | null
          id: string
          name: string
          notes: string | null
          quantity: number | null
          store_id: string
          supplier: string | null
          type: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          dimensions?: string | null
          id?: string
          name: string
          notes?: string | null
          quantity?: number | null
          store_id: string
          supplier?: string | null
          type?: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          dimensions?: string | null
          id?: string
          name?: string
          notes?: string | null
          quantity?: number | null
          store_id?: string
          supplier?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "packaging_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      printers: {
        Row: {
          created_at: string
          id: string
          maintenance_cost_monthly: number | null
          model: string | null
          name: string
          notes: string | null
          power_consumption_watts: number | null
          store_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          maintenance_cost_monthly?: number | null
          model?: string | null
          name: string
          notes?: string | null
          power_consumption_watts?: number | null
          store_id: string
        }
        Update: {
          created_at?: string
          id?: string
          maintenance_cost_monthly?: number | null
          model?: string | null
          name?: string
          notes?: string | null
          power_consumption_watts?: number | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "printers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number | null
          store_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number | null
          store_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          card_fee_percent: number | null
          category_id: string | null
          color_options: string[] | null
          created_at: string
          customization_type: string | null
          description: string | null
          has_color_variation: boolean | null
          id: string
          is_active: boolean | null
          is_customizable: boolean | null
          is_on_sale: boolean | null
          name: string
          packaging_cost: number | null
          photos: string[] | null
          post_production_cost: number | null
          production_cost: number | null
          production_time_minutes: number | null
          sale_price: number
          sale_price_promotional: number | null
          stl_file_url: string | null
          store_id: string
          updated_at: string
          waste_rate_percent: number | null
          weight_grams: number | null
        }
        Insert: {
          card_fee_percent?: number | null
          category_id?: string | null
          color_options?: string[] | null
          created_at?: string
          customization_type?: string | null
          description?: string | null
          has_color_variation?: boolean | null
          id?: string
          is_active?: boolean | null
          is_customizable?: boolean | null
          is_on_sale?: boolean | null
          name: string
          packaging_cost?: number | null
          photos?: string[] | null
          post_production_cost?: number | null
          production_cost?: number | null
          production_time_minutes?: number | null
          sale_price?: number
          sale_price_promotional?: number | null
          stl_file_url?: string | null
          store_id: string
          updated_at?: string
          waste_rate_percent?: number | null
          weight_grams?: number | null
        }
        Update: {
          card_fee_percent?: number | null
          category_id?: string | null
          color_options?: string[] | null
          created_at?: string
          customization_type?: string | null
          description?: string | null
          has_color_variation?: boolean | null
          id?: string
          is_active?: boolean | null
          is_customizable?: boolean | null
          is_on_sale?: boolean | null
          name?: string
          packaging_cost?: number | null
          photos?: string[] | null
          post_production_cost?: number | null
          production_cost?: number | null
          production_time_minutes?: number | null
          sale_price?: number
          sale_price_promotional?: number | null
          stl_file_url?: string | null
          store_id?: string
          updated_at?: string
          waste_rate_percent?: number | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saas_config: {
        Row: {
          id: string
          s3_access_key: string | null
          s3_bucket_name: string | null
          s3_endpoint: string | null
          s3_region: string | null
          s3_secret_key: string | null
          saas_whatsapp_number: string | null
          smtp_from_email: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_user: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          s3_access_key?: string | null
          s3_bucket_name?: string | null
          s3_endpoint?: string | null
          s3_region?: string | null
          s3_secret_key?: string | null
          saas_whatsapp_number?: string | null
          smtp_from_email?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          s3_access_key?: string | null
          s3_bucket_name?: string | null
          s3_endpoint?: string | null
          s3_region?: string | null
          s3_secret_key?: string | null
          saas_whatsapp_number?: string | null
          smtp_from_email?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      store_customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          store_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          store_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_customers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          created_at: string
          footer_text: string | null
          header_text: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          primary_color: string | null
          product_columns: number | null
          secondary_color: string | null
          subscription_plan_id: string | null
          subscription_started_at: string | null
          subscription_status: string | null
          updated_at: string
          user_id: string
          whatsapp_floating_enabled: boolean | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          footer_text?: string | null
          header_text?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          product_columns?: number | null
          secondary_color?: string | null
          subscription_plan_id?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id: string
          whatsapp_floating_enabled?: boolean | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          footer_text?: string | null
          header_text?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          product_columns?: number | null
          secondary_color?: string | null
          subscription_plan_id?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_floating_enabled?: boolean | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_trial: boolean
          max_photos_per_product: number
          max_products: number
          name: string
          payment_methods: string[] | null
          price_monthly: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_trial?: boolean
          max_photos_per_product?: number
          max_products?: number
          name: string
          payment_methods?: string[] | null
          price_monthly?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_trial?: boolean
          max_photos_per_product?: number
          max_products?: number
          name?: string
          payment_methods?: string[] | null
          price_monthly?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "store_admin"
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
      app_role: ["super_admin", "store_admin"],
    },
  },
} as const
