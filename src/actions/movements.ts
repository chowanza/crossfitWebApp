"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MovementCategory } from "@/lib/types/database";

export async function createMovement(formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const category = formData.get("category") as MovementCategory;
    const media_url = (formData.get("media_url") as string) || null;

    const { error } = await supabase.from("movements").insert({
        name,
        description,
        category,
        media_url,
    });

    if (error) return { error: error.message };

    revalidatePath("/admin/movements");
    return { success: true };
}

export async function updateMovement(id: string, formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const category = formData.get("category") as MovementCategory;
    const media_url = (formData.get("media_url") as string) || null;

    const { error } = await supabase
        .from("movements")
        .update({ name, description, category, media_url })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/movements");
    return { success: true };
}

export async function deleteMovement(id: string) {
    const supabase = await createClient();

    const { error } = await supabase.from("movements").delete().eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/movements");
    return { success: true };
}
