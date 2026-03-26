"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

export function SearchInput({ placeholder = "Buscar..." }: { placeholder?: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();
    
    const [term, setTerm] = useState(searchParams.get("query")?.toString() || "");

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (term) {
                params.set("query", term);
            } else {
                params.delete("query");
            }
            startTransition(() => {
                replace(`${pathname}?${params.toString()}`);
            });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [term, pathname, searchParams, replace]);

    return (
        <div className="relative flex-1 w-full sm:max-w-xs transition-all">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="text"
                placeholder={placeholder}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="pl-9 h-10 w-full bg-background"
            />
            {isPending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                </div>
            )}
        </div>
    );
}
