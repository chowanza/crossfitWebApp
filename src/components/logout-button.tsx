"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
    isMobile?: boolean;
}

export function LogoutButton({ isMobile = false }: LogoutButtonProps) {
    const { pending } = useFormStatus();

    if (isMobile) {
        return (
            <Button
                type="submit"
                variant="ghost"
                size="icon"
                disabled={pending}
                className="w-full h-10 px-0 flex flex-col justify-center items-center gap-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl"
            >
                <LogOut className={cn("h-5 w-5", pending && "animate-pulse")} />
                <span className="text-[10px] font-medium tracking-tight">
                    {pending ? "Saliendo..." : "Salir"}
                </span>
            </Button>
        );
    }

    return (
        <Button
            type="submit"
            variant="ghost"
            disabled={pending}
            isLoading={pending}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
        >
            {!pending && <LogOut className="h-4 w-4" />}
            {pending ? "Cerrando sesión..." : "Cerrar sesión"}
        </Button>
    );
}
