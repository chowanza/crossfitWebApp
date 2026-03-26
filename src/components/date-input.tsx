"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export function DateInput({ placeholder = "Filtrar por fecha..." }: { placeholder?: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleDateChange = (date: string) => {
        const params = new URLSearchParams(searchParams);
        if (date) {
            params.set("date", date);
        } else {
            params.delete("date");
        }
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="relative flex flex-1 w-full sm:w-auto">
            <Input
                type="date"
                className="w-full peer pr-10"
                defaultValue={searchParams.get("date")?.toString()}
                onChange={(e) => handleDateChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}
