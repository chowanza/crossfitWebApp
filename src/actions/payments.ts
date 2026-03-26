"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { PaymentStatus } from "@/lib/types/database";

export async function registerPayment(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado." };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "ADMIN" && profile?.role !== "SUPERADMIN") {
        return { error: "Operación denegada. Nivel de autorización insuficiente." };
    }

    const user_id = formData.get("user_id") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const period_start = formData.get("period_start") as string;
    const period_end = formData.get("period_end") as string;
    
    // Combine form data seamlessly into a descriptive string block
    const rawNotes = (formData.get("notes") as string) || "";
    const paymentMethod = formData.get("payment_method") as string;
    const reference = formData.get("reference") as string;

    let buildNotes = paymentMethod ? `Método: ${paymentMethod}` : "";
    if (reference) buildNotes += ` | Ref: ${reference}`;
    if (rawNotes) buildNotes += ` | Concepto: ${rawNotes}`;

    const status = (formData.get("status") as PaymentStatus) || "PAID";

    if (isNaN(amount) || amount <= 0) {
        return { error: "El monto debe ser un número positivo." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("payments").insert({
        user_id,
        amount,
        period_start,
        period_end,
        status,
        notes: buildNotes,
        registered_by: user.id,
    });

    if (error) return { error: error.message };

    if (status === "PAID") {
        await adminClient
            .from("profiles")
            .update({ last_payment_date: period_end, is_active: true })
            .eq("id", user_id);
    } else if (status === "OVERDUE") {
        await adminClient
            .from("profiles")
            .update({ is_active: false })
            .eq("id", user_id);
    }

    revalidatePath("/admin/payments");
    return { success: true };
}

export async function updatePaymentStatus(id: string, status: PaymentStatus) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado." };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "ADMIN" && profile?.role !== "SUPERADMIN") {
        return { error: "Operación denegada. Nivel de autorización insuficiente." };
    }

    const adminClient = createAdminClient();
    const { error, data: paymentData } = await adminClient
        .from("payments")
        .update({ status })
        .eq("id", id)
        .select("user_id, period_end")
        .single();

    if (error) return { error: error.message };

    if (status === "PAID" && paymentData) {
        await adminClient
            .from("profiles")
            .update({ last_payment_date: paymentData.period_end, is_active: true })
            .eq("id", paymentData.user_id);
    } else if (status === "OVERDUE" && paymentData) {
        await adminClient
            .from("profiles")
            .update({ is_active: false })
            .eq("id", paymentData.user_id);
    }

    revalidatePath("/admin/payments");
    return { success: true };
}

export async function deletePayment(id: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado." };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "SUPERADMIN") {
        return { error: "Solo los SUPERADMIN pueden borrar recibos de pago." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from("payments")
        .delete()
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/payments");
    return { success: true };
}
