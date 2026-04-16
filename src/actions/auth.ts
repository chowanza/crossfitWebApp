"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPasswordResetEmail } from "@/lib/email";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    redirect("/");
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}

export async function resetPassword(formData: FormData) {
    const adminSupabase = createAdminClient();
    const email = formData.get("email") as string;

    if (!email) {
        return { error: "Por favor ingresa tu correo electrónico." };
    }

    // 1. Generar el link de restablecimiento sin que Supabase envíe el email.
    //    Requiere service_role key. El link ya incluye el token seguro.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
            redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
        },
    });

    if (linkError) {
        // Para seguridad, no revelar si el email existe o no en el sistema.
        // Retornamos éxito igualmente (comportamiento estándar de auth).
        console.error("[Auth] Error generando link de recovery:", linkError.message);
        return { success: true };
    }

    // 2. Obtener el nombre del perfil para personalizar el email.
    const userId = linkData.user?.id;
    let firstName = "Atleta";

    if (userId) {
        const { data: profile } = await adminSupabase
            .from("profiles")
            .select("full_name")
            .eq("id", userId)
            .single();

        if (profile?.full_name) {
            firstName = profile.full_name.split(" ")[0];
        }
    }

    // 3. Enviar el email con Resend usando el link generado por Supabase.
    const resetLink = linkData.properties?.action_link;

    if (!resetLink) {
        return { error: "No se pudo generar el enlace de recuperación. Intenta nuevamente." };
    }

    try {
        await sendPasswordResetEmail({ to: email, resetLink, firstName });
    } catch (err) {
        console.error("[Resend] Error:", err);
        return { error: "Hubo un problema al enviar el correo. Intenta en unos minutos." };
    }

    return { success: true };
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();
    const password = formData.get("password") as string;

    if (!password || password.length < 6) {
        return { error: "La contraseña debe tener al menos 6 caracteres." };
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    });

    if (error) {
        return { error: error.message };
    }

    redirect("/");
}
