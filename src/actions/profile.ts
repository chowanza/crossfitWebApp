"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: {
    full_name: string;
    weight_kg: string;
    height_cm: string;
    avatar_url?: string;
    cedula?: string;
    phone?: string;
    birth_date?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "No autorizado." };
    }

    const updateData: Record<string, unknown> = {
        full_name: formData.full_name,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        cedula: formData.cedula || null,
        phone: formData.phone || null,
        birth_date: formData.birth_date || null,
    };

    if (formData.avatar_url !== undefined) {
        updateData.avatar_url = formData.avatar_url;
    }

    const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/profile");
    return { success: true };
}
