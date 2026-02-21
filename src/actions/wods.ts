"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { WodType } from "@/lib/types/database";

export async function createWod(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "No autenticado." };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const wod_type = formData.get("wod_type") as WodType;
    const date = (formData.get("date") as string) || new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("wods").insert({
        title,
        description,
        wod_type,
        date,
        created_by: user.id,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/wods");
    return { success: true };
}

export async function updateWod(id: string, formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const wod_type = formData.get("wod_type") as WodType;
    const date = formData.get("date") as string;

    const { error } = await supabase
        .from("wods")
        .update({ title, description, wod_type, date })
        .eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/wods");
    return { success: true };
}

export async function deleteWod(id: string) {
    const supabase = await createClient();

    const { error } = await supabase.from("wods").delete().eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/wods");
    return { success: true };
}
