import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar, MobileNav } from "@/components/sidebar";
import { NotificationBell } from "@/components/notifications";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppRatingModal } from "@/components/app-rating-modal";
import { MobileBurgerMenu } from "@/components/mobile-burger-menu";
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
        .select("full_name, role, avatar_url")
        .eq("id", user.id)
        .single();

    const profile = data as Pick<Profile, "full_name" | "role" | "avatar_url"> | null;
    const fullName = profile?.full_name || "Usuario";
    const role = profile?.role || "USER";
    const avatarUrl = profile?.avatar_url || null;

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
            <Sidebar fullName={fullName} role={role} avatarUrl={avatarUrl} />
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar con notificaciones y theme toggle */}
                <header className="flex items-center justify-between gap-2 px-4 md:px-8 py-3 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
                    <div className="flex items-center">
                        <MobileBurgerMenu fullName={fullName} role={role} avatarUrl={avatarUrl} />
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <NotificationBell
                            notifications={notifications}
                            unreadCount={unreadCount}
                        />
                        <span className="text-sm text-muted-foreground hidden md:inline ml-2">
                            {fullName}
                        </span>
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-x-hidden">{children}</main>
            </div>
            <MobileNav fullName={fullName} role={role} avatarUrl={avatarUrl} />

            {/* App Rating Modal — aparece 1 vez al mes */}
            <AppRatingModal
                hasRatedThisMonth={hasRatedThisMonth}
                currentPeriod={currentPeriod}
            />
        </div>
    );
}
