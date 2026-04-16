import type { SectionType } from "./database";

export interface WodMovementDraft {
    id: string; // Temporary ID for frontend state
    movement_id: string; // Real UUID from database
    reps: string | number; // String allows empty state in inputs
    weight_kg: string | number;
    order_index: number;
    athlete_weights?: { athlete_id: string; weight_kg: number }[]; // Custom weights per user
}

export interface WodSectionDraft {
    id: string; // Temporary ID for frontend state
    type: SectionType;
    order_index: number;
    time_cap_seconds?: string | number;
    movements: WodMovementDraft[];
}

export interface WodDraft {
    title: string;
    notes: string;
    date: string;
    sections: WodSectionDraft[];
}
