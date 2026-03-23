// ============================================================
// Tipos TypeScript — Iron Fit Venezuela
// Sincronizado con supabase/schema.sql + schema-fase2.sql + schema-fase3.sql
//                  + schema-fase4.sql + schema-wod-refactor.sql
// ============================================================

export type UserRole = "SUPERADMIN" | "ADMIN" | "USER";
export type SectionType = "AMRAP" | "EMOM" | "FOR_TIME" | "TABATA" | "STRENGTH" | "CUSTOM";
export type ScoreType = "TIME" | "REPS" | "ROUNDS" | "WEIGHT" | "CALORIES" | "POINTS";
export type MovementCategory = "WEIGHTLIFTING" | "GYMNASTICS" | "CARDIO" | "OTHER";
export type PaymentStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
export type NotificationType = "PAYMENT" | "WOD" | "PR" | "SYSTEM" | "REMINDER";

// Keep WodType as alias for backwards compat in recommendations.ts
export type WodType = SectionType;

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
                    coach_schedule: string | null;
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
                    coach_schedule?: string | null;
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
                    coach_schedule?: string | null;
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
                    notes: string;
                    created_by: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    date?: string;
                    title: string;
                    notes?: string;
                    created_by: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    date?: string;
                    title?: string;
                    notes?: string;
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
            wod_sections: {
                Row: {
                    id: string;
                    wod_id: string;
                    section_type: SectionType;
                    time_cap_seconds: number | null;
                    description: string;
                    order_index: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    wod_id: string;
                    section_type?: SectionType;
                    time_cap_seconds?: number | null;
                    description?: string;
                    order_index?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    wod_id?: string;
                    section_type?: SectionType;
                    time_cap_seconds?: number | null;
                    description?: string;
                    order_index?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "wod_sections_wod_id_fkey";
                        columns: ["wod_id"];
                        isOneToOne: false;
                        referencedRelation: "wods";
                        referencedColumns: ["id"];
                    }
                ];
            };
            wod_section_movements: {
                Row: {
                    id: string;
                    section_id: string;
                    movement_id: string;
                    reps: number | null;
                    weight_kg: number | null;
                    notes: string;
                    order_index: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    section_id: string;
                    movement_id: string;
                    reps?: number | null;
                    weight_kg?: number | null;
                    notes?: string;
                    order_index?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    section_id?: string;
                    movement_id?: string;
                    reps?: number | null;
                    weight_kg?: number | null;
                    notes?: string;
                    order_index?: number;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "wod_section_movements_section_id_fkey";
                        columns: ["section_id"];
                        isOneToOne: false;
                        referencedRelation: "wod_sections";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "wod_section_movements_movement_id_fkey";
                        columns: ["movement_id"];
                        isOneToOne: false;
                        referencedRelation: "movements";
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
                    media_url: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description?: string;
                    category?: MovementCategory;
                    media_url?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string;
                    category?: MovementCategory;
                    media_url?: string | null;
                    created_at?: string;
                };
                Relationships: [];
            };
            wod_results: {
                Row: {
                    id: string;
                    section_id: string;
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
                    section_id: string;
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
                    section_id?: string;
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
                        foreignKeyName: "wod_results_section_id_fkey";
                        columns: ["section_id"];
                        isOneToOne: false;
                        referencedRelation: "wod_sections";
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
            payments: {
                Row: {
                    id: string;
                    user_id: string;
                    amount: number;
                    status: PaymentStatus;
                    payment_date: string | null;
                    period_start: string;
                    period_end: string;
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    amount: number;
                    status?: PaymentStatus;
                    payment_date?: string | null;
                    period_start: string;
                    period_end: string;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    amount?: number;
                    status?: PaymentStatus;
                    payment_date?: string | null;
                    period_start?: string;
                    period_end?: string;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "payments_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    type: NotificationType;
                    title: string;
                    message: string;
                    link: string | null;
                    is_read: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    type?: NotificationType;
                    title: string;
                    message?: string;
                    link?: string | null;
                    is_read?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    type?: NotificationType;
                    title?: string;
                    message?: string;
                    link?: string | null;
                    is_read?: boolean;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "notifications_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            class_sessions: {
                Row: {
                    id: string;
                    wod_id: string;
                    user_id: string;
                    rating: number;
                    comment: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    wod_id: string;
                    user_id: string;
                    rating: number;
                    comment?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    wod_id?: string;
                    user_id?: string;
                    rating?: number;
                    comment?: string;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "class_sessions_wod_id_fkey";
                        columns: ["wod_id"];
                        isOneToOne: false;
                        referencedRelation: "wods";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "class_sessions_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            app_ratings: {
                Row: {
                    id: string;
                    user_id: string;
                    rating: number;
                    period: string;
                    comment: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    rating: number;
                    period: string;
                    comment?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    rating?: number;
                    period?: string;
                    comment?: string;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "app_ratings_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: {
            user_role: UserRole;
            section_type: SectionType;
            score_type: ScoreType;
            movement_category: MovementCategory;
            payment_status: PaymentStatus;
            notification_type: NotificationType;
        };
        CompositeTypes: Record<string, never>;
    };
}

// ----- Helpers -----
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Wod = Database["public"]["Tables"]["wods"]["Row"];
export type WodSection = Database["public"]["Tables"]["wod_sections"]["Row"];
export type WodSectionMovement = Database["public"]["Tables"]["wod_section_movements"]["Row"];
export type Movement = Database["public"]["Tables"]["movements"]["Row"];
export type WodResult = Database["public"]["Tables"]["wod_results"]["Row"];
export type PersonalRecord = Database["public"]["Tables"]["personal_records"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type ClassSession = Database["public"]["Tables"]["class_sessions"]["Row"];
export type AppRating = Database["public"]["Tables"]["app_ratings"]["Row"];
