"use client";

import { useState } from "react";
import { activateAthlete } from "@/actions/athletes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

interface ActivateAthleteButtonProps {
    athleteId: string;
    athleteName: string;
}

export function ActivateAthleteButton({ athleteId, athleteName }: ActivateAthleteButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleActivate() {
        setLoading(true);
        const result = await activateAthlete(athleteId);
        if (result?.error) {
            toast.error("Error al activar: " + result.error);
        } else {
            toast.success(`✅ ${athleteName} activado. Se envió correo de bienvenida.`);
        }
        setLoading(false);
    }

    return (
        <Button
            size="sm"
            onClick={handleActivate}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 text-xs font-semibold gap-1.5"
        >
            {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
                <CheckCircle className="h-3.5 w-3.5" />
            )}
            {loading ? "Activando..." : "Activar"}
        </Button>
    );
}
