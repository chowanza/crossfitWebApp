"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function logPersonalRecord(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado." };

    const movement_id = formData.get("movement_id") as string;
    const weight_value = parseFloat(formData.get("weight_value") as string);
    const reps = parseInt(formData.get("reps") as string) || 1;
    const notes = (formData.get("notes") as string) || "";

    if (isNaN(weight_value) || weight_value <= 0) {
        return { error: "El peso debe ser un número positivo." };
    }

    const { error } = await supabase.from("personal_records").insert({
        user_id: user.id,
        movement_id,
        weight_value,
        reps,
        notes,
    });

    if (error) return { error: error.message };

    revalidatePath("/prs");
    return { success: true };
}

export async function deletePersonalRecord(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("personal_records")
        .delete()
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/prs");
    return { success: true };
}
