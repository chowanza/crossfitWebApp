"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DateFilter() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const hasDateFilter = !!dateFrom || !!dateTo;

    function updateParam(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    }

    function clearDates() {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("dateFrom");
        params.delete("dateTo");
        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    }

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Fecha:
            </span>
            <div className="relative">
                <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => updateParam("dateFrom", e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer [color-scheme:dark]"
                    title="Desde"
                />
            </div>
            <span className="text-muted-foreground text-sm">→</span>
            <div className="relative">
                <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => updateParam("dateTo", e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer [color-scheme:dark]"
                    title="Hasta"
                />
            </div>
            {hasDateFilter && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDates}
                    className="h-9 px-2 text-muted-foreground hover:text-foreground"
                    title="Limpiar fechas"
                >
                    {isPending ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    ) : (
                        <X className="h-4 w-4" />
                    )}
                </Button>
            )}
            {isPending && !hasDateFilter && (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            )}
        </div>
    );
}
