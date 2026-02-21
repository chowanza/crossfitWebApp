// ============================================================
// Tipos TypeScript — Iron Fit Venezuela
// Sincronizado con supabase/schema.sql + schema-fase2.sql
// ============================================================

export type UserRole = "ADMIN" | "USER";
export type WodType = "AMRAP" | "EMOM" | "FOR_TIME" | "TABATA" | "CUSTOM";
export type ScoreType = "TIME" | "REPS" | "ROUNDS" | "WEIGHT" | "CALORIES" | "POINTS";
export type MovementCategory = "WEIGHTLIFTING" | "GYMNASTICS" | "CARDIO" | "OTHER";

// ----- Supabase Database type -----

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    role: UserRole;
                    full_name: string;
                    avatar_url: string | null;
                    weight_kg: number | null;
                    height_cm: number | null;
                    last_payment_date: string | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    role?: UserRole;
                    full_name?: string;
                    avatar_url?: string | null;
                    weight_kg?: number | null;
                    height_cm?: number | null;
                    last_payment_date?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    role?: UserRole;
                    full_name?: string;
                    avatar_url?: string | null;
                    weight_kg?: number | null;
                    height_cm?: number | null;
                    last_payment_date?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            wods: {
                Row: {
                    id: string;
                    date: string;
                    title: string;
                    description: string;
                    wod_type: WodType;
                    created_by: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    date?: string;
                    title: string;
                    description?: string;
                    wod_type?: WodType;
                    created_by: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    date?: string;
                    title?: string;
                    description?: string;
                    wod_type?: WodType;
                    created_by?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "wods_created_by_fkey";
                        columns: ["created_by"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            movements: {
                Row: {
                    id: string;
                    name: string;
                    description: string;
                    category: MovementCategory;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description?: string;
                    category?: MovementCategory;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string;
                    category?: MovementCategory;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            wod_results: {
                Row: {
                    id: string;
                    wod_id: string;
                    user_id: string;
                    score_value: string;
                    score_type: ScoreType;
                    rx: boolean;
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    wod_id: string;
                    user_id: string;
                    score_value: string;
                    score_type?: ScoreType;
                    rx?: boolean;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    wod_id?: string;
                    user_id?: string;
                    score_value?: string;
                    score_type?: ScoreType;
                    rx?: boolean;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "wod_results_wod_id_fkey";
                        columns: ["wod_id"];
                        isOneToOne: false;
                        referencedRelation: "wods";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "wod_results_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            personal_records: {
                Row: {
                    id: string;
                    user_id: string;
                    movement_id: string;
                    weight_value: number;
                    reps: number;
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    movement_id: string;
                    weight_value: number;
                    reps?: number;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    movement_id?: string;
                    weight_value?: number;
                    reps?: number;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "personal_records_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "personal_records_movement_id_fkey";
                        columns: ["movement_id"];
                        isOneToOne: false;
                        referencedRelation: "movements";
                        referencedColumns: ["id"];
                    }
                ];
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: {
            user_role: UserRole;
            wod_type: WodType;
            score_type: ScoreType;
            movement_category: MovementCategory;
        };
        CompositeTypes: Record<string, never>;
    };
}

// ----- Helpers -----
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Wod = Database["public"]["Tables"]["wods"]["Row"];
export type Movement = Database["public"]["Tables"]["movements"]["Row"];
export type WodResult = Database["public"]["Tables"]["wod_results"]["Row"];
export type PersonalRecord = Database["public"]["Tables"]["personal_records"]["Row"];
