"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import type { UserRole } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Dumbbell,
    Trophy,
    User,
    Activity,
    CreditCard,
    Users,
    LineChart,
    LogOut,
    Menu,
} from "lucide-react";

interface MobileBurgerMenuProps {
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

export function MobileBurgerMenu({ fullName, role }: MobileBurgerMenuProps) {
    const pathname = usePathname();
    const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menú</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80vw] sm:w-[350px] p-0 flex flex-col pt-10">
                <SheetHeader className="p-4 text-left border-b border-border">
                    <SheetTitle className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm shadow-blue-500/20 text-sm font-black text-white">
                            IF
                        </div>
                        <div>
                            <span className="text-lg font-bold leading-tight tracking-tight block">Iron Fit</span>
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Venezuela</span>
                        </div>
                    </SheetTitle>
                </SheetHeader>

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
                                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-200",
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
            </SheetContent>
        </Sheet>
    );
}
