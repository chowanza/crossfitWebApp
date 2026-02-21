"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PaymentStatus } from "@/lib/types/database";

export async function registerPayment(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado." };

    const user_id = formData.get("user_id") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const period_start = formData.get("period_start") as string;
    const period_end = formData.get("period_end") as string;
    const notes = (formData.get("notes") as string) || "";
    const status = (formData.get("status") as PaymentStatus) || "PAID";

    if (isNaN(amount) || amount <= 0) {
        return { error: "El monto debe ser un número positivo." };
    }

    const { error } = await supabase.from("payments").insert({
        user_id,
        amount,
        period_start,
        period_end,
        status,
        notes,
        registered_by: user.id,
    });

    if (error) return { error: error.message };

    revalidatePath("/admin/payments");
    return { success: true };
}

export async function updatePaymentStatus(id: string, status: PaymentStatus) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("payments")
        .update({ status })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/payments");
    return { success: true };
}
