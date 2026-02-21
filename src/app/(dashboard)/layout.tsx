import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar, MobileNav } from "@/components/sidebar";
import type { Profile } from "@/lib/types/database";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

    const profile = data as Pick<Profile, "full_name" | "role"> | null;
    const fullName = profile?.full_name || "Usuario";
    const role = profile?.role || "USER";

    return (
        <div className="flex min-h-screen bg-zinc-950 text-white">
            <Sidebar fullName={fullName} role={role} />
            <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">{children}</main>
            <MobileNav fullName={fullName} role={role} />
        </div>
    );
}
