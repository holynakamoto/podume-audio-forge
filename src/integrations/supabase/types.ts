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
      podcast_jobs: {
        Row: {
          audio_url: string | null
          created_at: string | null
          error_message: string | null
          id: string
          linkedin_profile_url: string
          metadata: Json | null
          profile_data: Json | null
          status: string
          transcript: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          linkedin_profile_url: string
          metadata?: Json | null
          profile_data?: Json | null
          status?: string
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          linkedin_profile_url?: string
          metadata?: Json | null
          profile_data?: Json | null
          status?: string
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      podcasts: {
        Row: {
          audio_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          package_type: string
          premium_assets: boolean | null
          resume_content: string | null
          social_assets: Json | null
          status: string | null
          title: string
          transcript: string | null
          updated_at: string | null
          user_id: string
          voice_clone: boolean | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          package_type: string
          premium_assets?: boolean | null
          resume_content?: string | null
          social_assets?: Json | null
          status?: string | null
          title: string
          transcript?: string | null
          updated_at?: string | null
          user_id: string
          voice_clone?: boolean | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          package_type?: string
          premium_assets?: boolean | null
          resume_content?: string | null
          social_assets?: Json | null
          status?: string | null
          title?: string
          transcript?: string | null
          updated_at?: string | null
          user_id?: string
          voice_clone?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action_details: Json | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          geo_location: Json | null
          id: string
          ip_address: unknown | null
          risk_level: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          geo_location?: Json | null
          id?: string
          ip_address?: unknown | null
          risk_level?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          geo_location?: Json | null
          id?: string
          ip_address?: unknown | null
          risk_level?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sharing_logs: {
        Row: {
          id: string
          platform: string
          podcast_id: string
          share_url: string | null
          shared_at: string | null
        }
        Insert: {
          id?: string
          platform: string
          podcast_id: string
          share_url?: string | null
          shared_at?: string | null
        }
        Update: {
          id?: string
          platform?: string
          podcast_id?: string
          share_url?: string | null
          shared_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sharing_logs_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          audio_url: string | null
          created_at: string
          error_message: string | null
          generated_script: string | null
          id: string
          profile_data: Json | null
          success_rate: string | null
          target_url: string | null
          test_name: string
          test_status: string
          test_timestamp: string
          updated_at: string
          validation_checks: Json | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          error_message?: string | null
          generated_script?: string | null
          id?: string
          profile_data?: Json | null
          success_rate?: string | null
          target_url?: string | null
          test_name: string
          test_status: string
          test_timestamp: string
          updated_at?: string
          validation_checks?: Json | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          error_message?: string | null
          generated_script?: string | null
          id?: string
          profile_data?: Json | null
          success_rate?: string | null
          target_url?: string | null
          test_name?: string
          test_status?: string
          test_timestamp?: string
          updated_at?: string
          validation_checks?: Json | null
        }
        Relationships: []
      }
      workflow_logs: {
        Row: {
          created_at: string | null
          data: Json | null
          execution_time_ms: number | null
          id: string
          job_id: string | null
          status: string
          step_name: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          execution_time_ms?: number | null
          id?: string
          job_id?: string | null
          status: string
          step_name: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          execution_time_ms?: number | null
          id?: string
          job_id?: string | null
          status?: string
          step_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "podcast_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_podcast_owner: {
        Args: { podcast_id: string; user_id: string }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_event_type: string
          p_user_id?: string
          p_event_data?: Json
          p_risk_level?: string
          p_ip_address?: unknown
          p_user_agent?: string
        }
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
