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
      custom_cells: {
        Row: {
          column_id: string
          id: string
          row_id: string
          value: string
        }
        Insert: {
          column_id: string
          id?: string
          row_id: string
          value?: string
        }
        Update: {
          column_id?: string
          id?: string
          row_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_cells_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "custom_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_cells_row_id_fkey"
            columns: ["row_id"]
            isOneToOne: false
            referencedRelation: "custom_rows"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_columns: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          table_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          table_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_columns_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "custom_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_rows: {
        Row: {
          created_at: string
          id: string
          table_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          table_id: string
        }
        Update: {
          created_at?: string
          id?: string
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_rows_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "custom_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_tables: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      gestion_vehicules: {
        Row: {
          concession: string
          created_at: string
          date_entree: string
          etat: string
          id: string
          immatriculation: string
          marque: string
          modele: string
          technicien: string
        }
        Insert: {
          concession?: string
          created_at?: string
          date_entree?: string
          etat?: string
          id?: string
          immatriculation?: string
          marque?: string
          modele?: string
          technicien?: string
        }
        Update: {
          concession?: string
          created_at?: string
          date_entree?: string
          etat?: string
          id?: string
          immatriculation?: string
          marque?: string
          modele?: string
          technicien?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          pseudo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pseudo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pseudo?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          a_verifier: boolean
          carrosserie_notes_chef: string
          carrosserie_notes_meca: string
          carrosserie_photos: Json
          carrosserie_photos_chef: Json
          carrosserie_taches: Json
          carrosserie_validees: Json
          created_at: string
          date_entree: string
          date_sortie: string
          has_carrosserie: boolean
          has_mecanique: boolean
          id: string
          immatriculation: string
          kilometrage: string
          mecanique_notes_chef: string
          mecanique_notes_meca: string
          mecanique_photos: Json
          mecanique_photos_chef: Json
          mecanique_taches: Json
          mecanique_validees: Json
          modele: string
          prenom: string
          sous_appret: boolean
        }
        Insert: {
          a_verifier?: boolean
          carrosserie_notes_chef?: string
          carrosserie_notes_meca?: string
          carrosserie_photos?: Json
          carrosserie_photos_chef?: Json
          carrosserie_taches?: Json
          carrosserie_validees?: Json
          created_at?: string
          date_entree?: string
          date_sortie?: string
          has_carrosserie?: boolean
          has_mecanique?: boolean
          id?: string
          immatriculation?: string
          kilometrage?: string
          mecanique_notes_chef?: string
          mecanique_notes_meca?: string
          mecanique_photos?: Json
          mecanique_photos_chef?: Json
          mecanique_taches?: Json
          mecanique_validees?: Json
          modele?: string
          prenom?: string
          sous_appret?: boolean
        }
        Update: {
          a_verifier?: boolean
          carrosserie_notes_chef?: string
          carrosserie_notes_meca?: string
          carrosserie_photos?: Json
          carrosserie_photos_chef?: Json
          carrosserie_taches?: Json
          carrosserie_validees?: Json
          created_at?: string
          date_entree?: string
          date_sortie?: string
          has_carrosserie?: boolean
          has_mecanique?: boolean
          id?: string
          immatriculation?: string
          kilometrage?: string
          mecanique_notes_chef?: string
          mecanique_notes_meca?: string
          mecanique_photos?: Json
          mecanique_photos_chef?: Json
          mecanique_taches?: Json
          mecanique_validees?: Json
          modele?: string
          prenom?: string
          sous_appret?: boolean
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      vehicules: {
        Row: {
          client: string | null
          created_at: string
          entree: string | null
          id: string
          immatriculation: string | null
          pieces: string | null
          sortie: string | null
          travaux: string | null
          updated_at: string
        }
        Insert: {
          client?: string | null
          created_at?: string
          entree?: string | null
          id?: string
          immatriculation?: string | null
          pieces?: string | null
          sortie?: string | null
          travaux?: string | null
          updated_at?: string
        }
        Update: {
          client?: string | null
          created_at?: string
          entree?: string | null
          id?: string
          immatriculation?: string | null
          pieces?: string | null
          sortie?: string | null
          travaux?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "technicien"
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
      app_role: ["admin", "technicien"],
    },
  },
} as const
