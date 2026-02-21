"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitClassFeedback(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado." };

    const wod_id = formData.get("wod_id") as string;
    const rating = parseInt(formData.get("rating") as string);
    const comment = (formData.get("comment") as string) || "";

    if (isNaN(rating) || rating < 1 || rating > 5) {
        return { error: "La calificación debe ser entre 1 y 5." };
    }

    // Upsert: si ya calificó este WOD, actualizar.
    const { error } = await supabase.from("class_sessions").upsert(
        {
            wod_id,
            user_id: user.id,
            rating,
            comment,
        },
        { onConflict: "wod_id,user_id" }
    );

    if (error) return { error: error.message };

    revalidatePath(`/wods/${wod_id}`);
    return { success: true };
}
