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
    Contact,
    LineChart,
    LogOut,
} from "lucide-react";

interface SidebarProps {
    fullName: string;
    role: UserRole;
    avatarUrl?: string | null;
}

const NAV_ITEMS = [
    { href: "/", label: "Inicio", icon: LayoutDashboard, roles: ["SUPERADMIN", "ADMIN", "USER"] as UserRole[] },
    { href: "/wods", label: "Entrenamientos", icon: Dumbbell, roles: ["SUPERADMIN", "ADMIN", "USER"] as UserRole[] },
    { href: "/prs", label: "PRs", icon: Trophy, roles: ["SUPERADMIN", "ADMIN", "USER"] as UserRole[] },
    { href: "/coaches", label: "Cuerpo Técnico", icon: Contact, roles: ["SUPERADMIN", "ADMIN", "USER"] as UserRole[] },
    { href: "/profile", label: "Perfil", icon: User, roles: ["SUPERADMIN", "ADMIN", "USER"] as UserRole[] },
    { href: "/admin/movements", label: "Movimientos", icon: Activity, roles: ["ADMIN", "SUPERADMIN"] as UserRole[] },
    { href: "/admin/payments", label: "Pagos", icon: CreditCard, roles: ["ADMIN", "SUPERADMIN"] as UserRole[] },
    { href: "/admin/athletes", label: "Atletas", icon: Users, roles: ["ADMIN", "SUPERADMIN"] as UserRole[] },
    { href: "/admin/ratings", label: "Satisfacción", icon: LineChart, roles: ["ADMIN", "SUPERADMIN"] as UserRole[] },
    { href: "/admin/coaches", label: "Gest. Coaches", icon: Contact, roles: ["SUPERADMIN"] as UserRole[] },
];

export function Sidebar({ fullName, role, avatarUrl }: SidebarProps) {
    const pathname = usePathname();
    const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-auto items-center justify-center">
                        <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
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
                                    ? "bg-indigo-600/10 text-indigo-600 font-semibold"
                                    : "text-muted-foreground font-medium hover:bg-accent hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-muted-foreground/70")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <Separator className="opacity-50" />

            {/* User footer */}
            <div className="p-4 space-y-4">
                <Link href="/profile" className="flex items-center gap-3 px-2 py-2 -mx-2 rounded-lg hover:bg-accent/50 transition-colors group">
                    {avatarUrl ? (
                        <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border border-border group-hover:border-indigo-600/30 transition-colors">
                            <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
                        </div>
                    ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600/10 text-xs font-bold text-indigo-600 shadow-sm group-hover:bg-indigo-600/20 transition-colors">
                            {fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase() || "?"}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate leading-tight group-hover:text-indigo-600 transition-colors">{fullName || "Usuario"}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            {role === "SUPERADMIN" ? "Superadmin" : role === "ADMIN" ? "Entrenador" : "Atleta"}
                        </p>
                    </div>
                </Link>
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

export function MobileNav({ fullName, role, avatarUrl }: SidebarProps) {
    const pathname = usePathname();

    // FitMe Navigation: 3 primary items for User.
    const userNavHrefs = ["/", "/wods", "/profile"];
    const filteredItems = role === "USER"
        ? NAV_ITEMS.filter((item) => userNavHrefs.includes(item.href))
        : NAV_ITEMS.filter((item) => item.roles.includes(role)).slice(0, 5);

    return (
        <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
            <div className="bg-card/95 backdrop-blur-xl border border-border/50 shadow-lg rounded-2xl p-1">
                <div className="flex items-center justify-around h-14 w-full">
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
                                    "relative flex flex-col items-center justify-center gap-1 flex-1 h-full text-[10px] sm:text-xs transition-all duration-200 font-medium rounded-xl",
                                    isActive ? "text-indigo-600 bg-indigo-600/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <Icon
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={cn(
                                        "h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200",
                                        isActive ? "scale-105" : "scale-100"
                                    )}
                                />
                                <span className={cn("truncate w-full text-center px-1 tracking-tight", isActive ? "font-bold" : "")}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
