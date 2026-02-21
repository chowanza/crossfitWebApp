"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ScoreType } from "@/lib/types/database";

export async function logWodResult(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado." };

    const wod_id = formData.get("wod_id") as string;
    const score_value = formData.get("score_value") as string;
    const score_type = formData.get("score_type") as ScoreType;
    const rx = formData.get("rx") === "true";
    const notes = (formData.get("notes") as string) || "";

    // Upsert: si ya existe un resultado para este WOD, lo reemplaza.
    const { error } = await supabase.from("wod_results").upsert(
        {
            wod_id,
            user_id: user.id,
            score_value,
            score_type,
            rx,
            notes,
        },
        { onConflict: "wod_id,user_id" }
    );

    if (error) return { error: error.message };

    revalidatePath(`/wods/${wod_id}`);
    return { success: true };
}

export async function deleteWodResult(resultId: string, wodId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("wod_results")
        .delete()
        .eq("id", resultId);

    if (error) return { error: error.message };

    revalidatePath(`/wods/${wodId}`);
    return { success: true };
}
