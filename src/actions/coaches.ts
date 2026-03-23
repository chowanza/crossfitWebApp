"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createCoach(formData: FormData) {
    // Verificar que quien llama es SUPERADMIN
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
        return { error: "Solo los administradores principales (SUPERADMIN) pueden crear entrenadores." };
    }

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("full_name") as string;
    const weightKg = formData.get("weight_kg") ? parseFloat(formData.get("weight_kg") as string) : null;
    const heightCm = formData.get("height_cm") ? parseFloat(formData.get("height_cm") as string) : null;
    const coachSchedule = formData.get("coach_schedule") as string || null;

    if (!email || !password || !fullName) {
        return { error: "Email, contraseña y nombre son obligatorios." };
    }

    if (password.length < 6) {
        return { error: "La contraseña debe tener al menos 6 caracteres." };
    }

    // Crear usuario con admin client
    const adminClient = createAdminClient();

    const { data: newUser, error: authError } =
        await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName },
        });

    if (authError) {
        return { error: authError.message };
    }

    if (!newUser.user) {
        return { error: "Error al crear el usuario." };
    }

    // Actualizar perfil asignando el rol de ADMIN (Entrenador)
    const { error: profileError } = await adminClient
        .from("profiles")
        .update({
            full_name: fullName,
            weight_kg: weightKg,
            height_cm: heightCm,
            coach_schedule: coachSchedule,
            role: "ADMIN",
            is_active: true,
        })
        .eq("id", newUser.user.id);

    if (profileError) {
        return { error: `Usuario creado, pero error en perfil: ${profileError.message}` };
    }

    revalidatePath("/admin/coaches");
    revalidatePath("/coaches");
    return { success: true };
}

export async function updateCoach(id: string, formData: FormData) {
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
        return { error: "Solo los administradores principales pueden editar entrenadores." };
    }

    const fullName = formData.get("full_name") as string;
    const weightKg = formData.get("weight_kg") ? parseFloat(formData.get("weight_kg") as string) : null;
    const heightCm = formData.get("height_cm") ? parseFloat(formData.get("height_cm") as string) : null;
    const isActive = formData.get("is_active") === "true";
    const coachSchedule = formData.get("coach_schedule") as string || null;

    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from("profiles")
        .update({
            full_name: fullName,
            weight_kg: weightKg,
            height_cm: heightCm,
            coach_schedule: coachSchedule,
            is_active: isActive,
        })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/coaches");
    revalidatePath("/coaches");
    return { success: true };
}

export async function deleteCoach(id: string) {
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
        return { error: "Solo los administradores principales pueden eliminar entrenadores." };
    }

    // Prevenir auto-eliminación
    if (user.id === id) {
        return { error: "No puedes eliminar tu propia cuenta." };
    }

    // Prevenir eliminación de SUPERADMIN
    const { data: targetProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", id)
        .single();

    if (targetProfile?.role === "SUPERADMIN") {
        return { error: "No se puede eliminar a un administrador principal (SUPERADMIN)." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(id);

    if (error) return { error: error.message };

    revalidatePath("/admin/coaches");
    revalidatePath("/coaches");
    return { success: true };
}
