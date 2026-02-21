"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import type { UserRole } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SidebarProps {
    fullName: string;
    role: UserRole;
}

const NAV_ITEMS = [
    { href: "/", label: "Dashboard", icon: "📊", roles: ["ADMIN", "USER"] as UserRole[] },
    { href: "/wods", label: "WODs", icon: "🏋️", roles: ["ADMIN", "USER"] as UserRole[] },
    { href: "/prs", label: "Mis PRs", icon: "🏆", roles: ["ADMIN", "USER"] as UserRole[] },
    { href: "/profile", label: "Mi Perfil", icon: "👤", roles: ["ADMIN", "USER"] as UserRole[] },
    { href: "/admin/wods", label: "Gestionar WODs", icon: "📝", roles: ["ADMIN"] as UserRole[] },
    { href: "/admin/movements", label: "Movimientos", icon: "💪", roles: ["ADMIN"] as UserRole[] },
];

export function Sidebar({ fullName, role }: SidebarProps) {
    const pathname = usePathname();

    const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800 bg-zinc-950 h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-black text-white">
                        IF
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white leading-tight">Iron Fit</h1>
                        <p className="text-xs text-zinc-500">Venezuela</p>
                    </div>
                </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
                {filteredItems.map((item) => {
                    const isActive =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-amber-500/10 text-amber-500"
                                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                            )}
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <Separator className="bg-zinc-800" />

            {/* User footer */}
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-amber-500">
                        {fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{fullName || "Usuario"}</p>
                        <p className="text-xs text-zinc-500">
                            {role === "ADMIN" ? "Entrenador" : "Atleta"}
                        </p>
                    </div>
                </div>
                <form action={logout}>
                    <Button
                        type="submit"
                        variant="ghost"
                        className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-500/10 text-sm"
                    >
                        Cerrar sesión
                    </Button>
                </form>
            </div>
        </aside>
    );
}

export function MobileNav({ fullName, role }: SidebarProps) {
    const pathname = usePathname();

    const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(role)).slice(0, 5);

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
            <div className="flex items-center justify-around px-2 py-2">
                {filteredItems.map((item) => {
                    const isActive =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors",
                                isActive ? "text-amber-500" : "text-zinc-500"
                            )}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="truncate max-w-[60px]">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
