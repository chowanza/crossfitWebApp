import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar, MobileNav } from "@/components/sidebar";
import { NotificationBell } from "@/components/notifications";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppRatingModal } from "@/components/app-rating-modal";
import type { Profile, Notification as NotifType } from "@/lib/types/database";

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

    // Notificaciones
    const { data: notificationsData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

    const notifications = (notificationsData || []) as NotifType[];
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    // App rating: verificar si ya calificó este mes
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const { data: existingRating } = await supabase
        .from("app_ratings")
        .select("id")
        .eq("user_id", user.id)
        .eq("period", currentPeriod)
        .single();

    const hasRatedThisMonth = !!existingRating;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar fullName={fullName} role={role} />
            <div className="flex-1 flex flex-col">
                {/* Top bar con notificaciones y theme toggle */}
                <header className="flex items-center justify-end gap-2 px-4 md:px-8 py-3 border-b border-border">
                    <ThemeToggle />
                    <NotificationBell
                        notifications={notifications}
                        unreadCount={unreadCount}
                    />
                    <span className="text-sm text-muted-foreground hidden md:inline">
                        {fullName}
                    </span>
                </header>
                <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">{children}</main>
            </div>
            <MobileNav fullName={fullName} role={role} />

            {/* App Rating Modal — aparece 1 vez al mes */}
            <AppRatingModal
                hasRatedThisMonth={hasRatedThisMonth}
                currentPeriod={currentPeriod}
            />
        </div>
    );
}
