import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            redirect(next);
        }
    }

    // Si hay error o no hay código, redirigir al login.
    redirect("/login");
}
