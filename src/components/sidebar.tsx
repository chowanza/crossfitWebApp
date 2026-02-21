"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import type { UserRole } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Dumbbell,
    Trophy,
    User,
    CalendarPlus,
    Activity,
    CreditCard,
    Users,
    LineChart,
    LogOut,
} from "lucide-react";

interface SidebarProps {
    fullName: string;
    role: UserRole;
}

const NAV_ITEMS = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "USER"] as UserRole[] },
    { href: "/wods", label: "WODs", icon: Dumbbell, roles: ["ADMIN", "USER"] as UserRole[] },
    { href: "/prs", label: "Mis PRs", icon: Trophy, roles: ["ADMIN", "USER"] as UserRole[] },
    { href: "/profile", label: "Mi Perfil", icon: User, roles: ["ADMIN", "USER"] as UserRole[] },
    { href: "/admin/movements", label: "Movimientos", icon: Activity, roles: ["ADMIN"] as UserRole[] },
    { href: "/admin/payments", label: "Pagos", icon: CreditCard, roles: ["ADMIN"] as UserRole[] },
    { href: "/admin/athletes", label: "Atletas", icon: Users, roles: ["ADMIN"] as UserRole[] },
    { href: "/admin/ratings", label: "Satisfacción", icon: LineChart, roles: ["ADMIN"] as UserRole[] },
];

export function Sidebar({ fullName, role }: SidebarProps) {
    const pathname = usePathname();
    const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm shadow-blue-500/20 text-sm font-black text-white">
                        IF
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-tight tracking-tight">Iron Fit</h1>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Venezuela</p>
                    </div>
                </div>
            </div>

            <Separator className="opacity-50" />

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {filteredItems.map((item) => {
                    const isActive =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                                isActive
                                    ? "bg-blue-500/10 text-blue-500 font-semibold"
                                    : "text-muted-foreground font-medium hover:bg-accent hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive ? "text-blue-500" : "text-muted-foreground/70")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <Separator className="opacity-50" />

            {/* User footer */}
            <div className="p-4 space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-500">
                        {fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate leading-tight">{fullName || "Usuario"}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-0.5">
                            {role === "ADMIN" ? "Entrenador" : "Atleta"}
                        </p>
                    </div>
                </div>
                <form action={logout}>
                    <Button
                        type="submit"
                        variant="ghost"
                        className="w-full justify-start gap-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                    </Button>
                </form>
            </div>
        </aside>
    );
}

export function MobileNav({ fullName, role }: SidebarProps) {
    const pathname = usePathname();
    // Mostrar max 5 items relevantes para mobile
    const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(role)).slice(0, 5);

    return (
        <>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-around px-1 py-1 max-w-md mx-auto h-16">
                    {filteredItems.map((item) => {
                        const isActive =
                            item.href === "/"
                                ? pathname === "/"
                                : pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] transition-all duration-200 font-medium",
                                    isActive ? "text-blue-500" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-b-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                )}
                                <Icon
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={cn(
                                        "h-5 w-5 mb-0.5 transition-transform duration-200",
                                        isActive ? "scale-110" : "scale-100"
                                    )}
                                />
                                <span className="truncate w-full text-center px-1 tracking-tight">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
