"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SectionType } from "@/lib/types/database";

interface SectionInput {
    section_type: SectionType;
    time_cap_seconds: number | null;
    description: string;
    order_index: number;
    movements: {
        movement_id: string;
        reps: number | null;
        weight_kg: number | null;
        notes: string;
        order_index: number;
        athlete_weights?: { athlete_id: string; weight_kg: number }[];
    }[];
}

export async function createWod(data: {
    title: string;
    date: string;
    notes: string;
    sections: SectionInput[];
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado." };

    // 1. Crear el WOD padre
    const { data: wod, error: wodError } = await supabase
        .from("wods")
        .insert({
            title: data.title,
            date: data.date || new Date().toISOString().split("T")[0],
            notes: data.notes,
            created_by: user.id,
        })
        .select("id")
        .single();

    if (wodError || !wod) return { error: wodError?.message || "Error al crear WOD." };

    // 2. Crear secciones
    for (const section of data.sections) {
        const { data: sec, error: secError } = await supabase
            .from("wod_sections")
            .insert({
                wod_id: wod.id,
                section_type: section.section_type,
                time_cap_seconds: section.time_cap_seconds,
                description: section.description,
                order_index: section.order_index,
            })
            .select("id")
            .single();

        if (secError || !sec) return { error: secError?.message || "Error al crear sección." };

        // 3. Crear movimientos en la sección
        if (section.movements.length > 0) {
            const movs = section.movements.map((m) => ({
                section_id: sec.id,
                movement_id: m.movement_id,
                reps: m.reps,
                weight_kg: m.weight_kg,
                notes: m.notes,
                order_index: m.order_index,
            }));

            const { data: insertedMovsData, error: movError } = await supabase
                .from("wod_section_movements")
                .insert(movs)
                .select();

            const insertedMovs = insertedMovsData as any[] | null;

            if (movError || !insertedMovs) return { error: movError?.message || "Error al crear movimientos." };

            const customWeights: any[] = [];
            for (const m of section.movements) {
                if (m.athlete_weights && m.athlete_weights.length > 0) {
                    const saved = insertedMovs.find((dbM: any) => dbM.order_index === m.order_index && dbM.movement_id === m.movement_id);
                    if (saved) {
                        for (const aw of m.athlete_weights) {
                            customWeights.push({
                                section_movement_id: saved.id,
                                athlete_id: aw.athlete_id,
                                weight_kg: aw.weight_kg
                            });
                        }
                    }
                }
            }

            if (customWeights.length > 0) {
                const { error: wError } = await supabase.from("athlete_wod_weights").insert(customWeights);
                if (wError) return { error: wError.message };
            }
        }
    }

    revalidatePath("/wods");
    revalidatePath("/admin/wods");
    return { success: true };
}

export async function updateWod(
    id: string,
    data: {
        title: string;
        date: string;
        notes: string;
        sections: SectionInput[];
    }
) {
    const supabase = await createClient();

    // 1. Actualizar WOD padre
    const { error: wodError } = await supabase
        .from("wods")
        .update({ title: data.title, date: data.date, notes: data.notes })
        .eq("id", id);

    if (wodError) return { error: wodError.message };

    // 2. Eliminar secciones viejas (cascade elimina movimientos)
    await supabase.from("wod_sections").delete().eq("wod_id", id);

    // 3. Reinsertar secciones nuevas
    for (const section of data.sections) {
        const { data: sec, error: secError } = await supabase
            .from("wod_sections")
            .insert({
                wod_id: id,
                section_type: section.section_type,
                time_cap_seconds: section.time_cap_seconds,
                description: section.description,
                order_index: section.order_index,
            })
            .select("id")
            .single();

        if (secError || !sec) return { error: secError?.message || "Error al crear sección." };

        if (section.movements.length > 0) {
            const movs = section.movements.map((m) => ({
                section_id: sec.id,
                movement_id: m.movement_id,
                reps: m.reps,
                weight_kg: m.weight_kg,
                notes: m.notes,
                order_index: m.order_index,
            }));

            const { data: insertedMovsData, error: movError } = await supabase
                .from("wod_section_movements")
                .insert(movs)
                .select();

            const insertedMovs = insertedMovsData as any[] | null;

            if (movError || !insertedMovs) return { error: movError?.message || "Error al crear movimientos." };

            const customWeights: any[] = [];
            for (const m of section.movements) {
                if (m.athlete_weights && m.athlete_weights.length > 0) {
                    const saved = insertedMovs.find((dbM: any) => dbM.order_index === m.order_index && dbM.movement_id === m.movement_id);
                    if (saved) {
                        for (const aw of m.athlete_weights) {
                            customWeights.push({
                                section_movement_id: saved.id,
                                athlete_id: aw.athlete_id,
                                weight_kg: aw.weight_kg
                            });
                        }
                    }
                }
            }

            if (customWeights.length > 0) {
                const { error: wError } = await supabase.from("athlete_wod_weights").insert(customWeights);
                if (wError) return { error: wError.message };
            }
        }
    }

    revalidatePath("/wods");
    revalidatePath("/admin/wods");
    return { success: true };
}

export async function deleteWod(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("wods").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/wods");
    revalidatePath("/admin/wods");
    return { success: true };
}
