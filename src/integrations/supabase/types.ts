export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agent_configurations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          model_config: Json | null
          model_name: string | null
          name: string
          provider_id: string | null
          system_prompt: string
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          model_config?: Json | null
          model_name?: string | null
          name: string
          provider_id?: string | null
          system_prompt: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          model_config?: Json | null
          model_name?: string | null
          name?: string
          provider_id?: string | null
          system_prompt?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_configurations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "llm_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          content_type: string | null
          cost: number | null
          created_at: string
          id: string
          metadata: Json | null
          role: string
          session_id: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          content_type?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          content_type?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          model_name: string | null
          project_id: string | null
          provider_id: string | null
          session_title: string | null
          session_type: string | null
          status: string | null
          total_cost: number | null
          total_messages: number | null
          total_tokens_used: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          model_name?: string | null
          project_id?: string | null
          provider_id?: string | null
          session_title?: string | null
          session_type?: string | null
          status?: string | null
          total_cost?: number | null
          total_messages?: number | null
          total_tokens_used?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          model_name?: string | null
          project_id?: string | null
          provider_id?: string | null
          session_title?: string | null
          session_type?: string | null
          status?: string | null
          total_cost?: number | null
          total_messages?: number | null
          total_tokens_used?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "llm_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      cli_commands: {
        Row: {
          command: string
          command_type: string | null
          created_at: string
          error_message: string | null
          executed_at: string | null
          execution_status: string | null
          execution_time_ms: number | null
          id: string
          metadata: Json | null
          output: string | null
          project_id: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          command: string
          command_type?: string | null
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          execution_status?: string | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          output?: string | null
          project_id?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          command?: string
          command_type?: string | null
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          execution_status?: string | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          output?: string | null
          project_id?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cli_commands_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cli_commands_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          configuration: Json
          created_at: string
          id: string
          integration_type: string
          is_active: boolean
          last_sync_at: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          id?: string
          integration_type: string
          is_active?: boolean
          last_sync_at?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          id?: string
          integration_type?: string
          is_active?: boolean
          last_sync_at?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      llm_models: {
        Row: {
          context_length: number | null
          created_at: string
          description: string | null
          display_name: string
          id: string
          input_cost_per_token: number | null
          is_active: boolean
          name: string
          output_cost_per_token: number | null
          provider_id: string
          supports_function_calling: boolean | null
          supports_vision: boolean | null
        }
        Insert: {
          context_length?: number | null
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          input_cost_per_token?: number | null
          is_active?: boolean
          name: string
          output_cost_per_token?: number | null
          provider_id: string
          supports_function_calling?: boolean | null
          supports_vision?: boolean | null
        }
        Update: {
          context_length?: number | null
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          input_cost_per_token?: number | null
          is_active?: boolean
          name?: string
          output_cost_per_token?: number | null
          provider_id?: string
          supports_function_calling?: boolean | null
          supports_vision?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "llm_models_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "llm_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_providers: {
        Row: {
          base_url: string | null
          created_at: string
          display_name: string
          documentation_url: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          base_url?: string | null
          created_at?: string
          display_name: string
          documentation_url?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          base_url?: string | null
          created_at?: string
          display_name?: string
          documentation_url?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      personal_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          permissions: Json | null
          token_hash: string
          token_name: string
          token_prefix: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          permissions?: Json | null
          token_hash: string
          token_name: string
          token_prefix: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          permissions?: Json | null
          token_hash?: string
          token_name?: string
          token_prefix?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          project_type: string | null
          settings: Json | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          project_type?: string | null
          settings?: Json | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_type?: string | null
          settings?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_analytics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          provider_id: string | null
          recorded_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          provider_id?: string | null
          recorded_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          provider_id?: string | null
          recorded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_analytics_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "llm_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_llm_credentials: {
        Row: {
          additional_config: Json | null
          api_key_encrypted: string
          created_at: string
          credential_name: string
          id: string
          is_active: boolean
          is_default: boolean | null
          last_test_at: string | null
          last_used_at: string | null
          provider_id: string
          test_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_config?: Json | null
          api_key_encrypted: string
          created_at?: string
          credential_name: string
          id?: string
          is_active?: boolean
          is_default?: boolean | null
          last_test_at?: string | null
          last_used_at?: string | null
          provider_id: string
          test_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_config?: Json | null
          api_key_encrypted?: string
          created_at?: string
          credential_name?: string
          id?: string
          is_active?: boolean
          is_default?: boolean | null
          last_test_at?: string | null
          last_used_at?: string | null
          provider_id?: string
          test_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_llm_credentials_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "llm_providers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
