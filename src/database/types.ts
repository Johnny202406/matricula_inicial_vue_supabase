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
      apoderado: {
        Row: {
          apellido: string | null
          dni: string | null
          id: number
          nombre: string | null
          numero: string | null
        }
        Insert: {
          apellido?: string | null
          dni?: string | null
          id?: number
          nombre?: string | null
          numero?: string | null
        }
        Update: {
          apellido?: string | null
          dni?: string | null
          id?: number
          nombre?: string | null
          numero?: string | null
        }
        Relationships: []
      }
      aula: {
        Row: {
          edad: number | null
          id: number
          id_docente: number | null
          nombre: string | null
        }
        Insert: {
          edad?: number | null
          id?: number
          id_docente?: number | null
          nombre?: string | null
        }
        Update: {
          edad?: number | null
          id?: number
          id_docente?: number | null
          nombre?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aula_id_docente_fkey"
            columns: ["id_docente"]
            isOneToOne: false
            referencedRelation: "docente"
            referencedColumns: ["id"]
          },
        ]
      }
      carrera: {
        Row: {
          anio: string
          created_at: string
          estudiantes: string
          id: number
          mes: string
          name: string
          status: Database["public"]["Enums"]["estados"]
        }
        Insert: {
          anio: string
          created_at?: string
          estudiantes?: string
          id?: never
          mes: string
          name: string
          status?: Database["public"]["Enums"]["estados"]
        }
        Update: {
          anio?: string
          created_at?: string
          estudiantes?: string
          id?: never
          mes?: string
          name?: string
          status?: Database["public"]["Enums"]["estados"]
        }
        Relationships: []
      }
      docente: {
        Row: {
          apellido: string | null
          dni: string | null
          id: number
          nombre: string | null
          numero: string | null
        }
        Insert: {
          apellido?: string | null
          dni?: string | null
          id?: number
          nombre?: string | null
          numero?: string | null
        }
        Update: {
          apellido?: string | null
          dni?: string | null
          id?: number
          nombre?: string | null
          numero?: string | null
        }
        Relationships: []
      }
      estudiante: {
        Row: {
          apellido: string | null
          dni: string | null
          id: number
          id_apoderado: number | null
          nombre: string | null
        }
        Insert: {
          apellido?: string | null
          dni?: string | null
          id?: number
          id_apoderado?: number | null
          nombre?: string | null
        }
        Update: {
          apellido?: string | null
          dni?: string | null
          id?: number
          id_apoderado?: number | null
          nombre?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estudiante_id_apoderado_fkey"
            columns: ["id_apoderado"]
            isOneToOne: false
            referencedRelation: "apoderado"
            referencedColumns: ["id"]
          },
        ]
      }
      matricula: {
        Row: {
          fecha: string | null
          id: number
          id_aula: number | null
          id_estudiante: number | null
          precio: number | null
        }
        Insert: {
          fecha?: string | null
          id?: number
          id_aula?: number | null
          id_estudiante?: number | null
          precio?: number | null
        }
        Update: {
          fecha?: string | null
          id?: number
          id_aula?: number | null
          id_estudiante?: number | null
          precio?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matricula_id_aula_fkey"
            columns: ["id_aula"]
            isOneToOne: false
            referencedRelation: "aula"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matricula_id_estudiante_fkey"
            columns: ["id_estudiante"]
            isOneToOne: false
            referencedRelation: "estudiante"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          created_at: string
          descripcion: string | null
          descuento_porcentaje: number
          id: number
          id_categoria: Database["public"]["Enums"]["categoria_enum"]
          id_marca: Database["public"]["Enums"]["marca_enum"]
          nombre: string
          precio: number
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          descuento_porcentaje?: number
          id?: never
          id_categoria: Database["public"]["Enums"]["categoria_enum"]
          id_marca: Database["public"]["Enums"]["marca_enum"]
          nombre: string
          precio: number
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          descuento_porcentaje?: number
          id?: never
          id_categoria?: Database["public"]["Enums"]["categoria_enum"]
          id_marca?: Database["public"]["Enums"]["marca_enum"]
          nombre?: string
          precio?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      categoria_enum: "electronica" | "ropa" | "hogar"
      estados: "activo" | "inactivo" | "en reposo"
      marca_enum: "sony" | "nike" | "samsung"
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
      categoria_enum: ["electronica", "ropa", "hogar"],
      estados: ["activo", "inactivo", "en reposo"],
      marca_enum: ["sony", "nike", "samsung"],
    },
  },
} as const
