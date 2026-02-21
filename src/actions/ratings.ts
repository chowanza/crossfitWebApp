"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitAppRating(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado." };

    const rating = parseInt(formData.get("rating") as string);
    const comment = (formData.get("comment") as string) || "";
    const period = formData.get("period") as string;

    if (isNaN(rating) || rating < 1 || rating > 5) {
        return { error: "La calificación debe ser entre 1 y 5." };
    }

    // Upsert: 1 rating por período.
    const { error } = await supabase.from("app_ratings").upsert(
        {
            user_id: user.id,
            rating,
            comment,
            period,
        },
        { onConflict: "user_id,period" }
    );

    if (error) return { error: error.message };

    revalidatePath("/");
    return { success: true };
}
