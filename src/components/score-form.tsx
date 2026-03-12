"use client";

import { useState } from "react";
import { logSectionResult } from "@/actions/results";
import { Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ScoreType, WodResult } from "@/lib/types/database";

interface ScoreFormProps {
    wodId: string;
    sectionId: string;
    existingResult?: WodResult | null;
}

const SCORE_TYPES: { value: ScoreType; label: string }[] = [
    { value: "TIME", label: "Tiempo (mm:ss)" },
    { value: "REPS", label: "Repeticiones" },
    { value: "ROUNDS", label: "Rondas + Reps" },
    { value: "WEIGHT", label: "Peso (kg/lb)" },
    { value: "CALORIES", label: "Calorías" },
    { value: "POINTS", label: "Puntos" },
];

export function ScoreForm({ wodId, sectionId, existingResult }: ScoreFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rx, setRx] = useState(existingResult?.rx ?? false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        setSuccess(false);

        formData.set("wod_id", wodId);
        formData.set("section_id", sectionId);
        formData.set("rx", rx.toString());

        const result = await logSectionResult(formData);
        if (result?.error) {
            setError(result.error);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tu Score</Label>
                    <Input
                        name="score_value"
                        defaultValue={existingResult?.score_value}
                        placeholder='Ej: "3:45", "150", "8+12"'
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                        name="score_type"
                        defaultValue={existingResult?.score_type || "TIME"}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SCORE_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setRx(!rx)}
                    className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors flex items-center gap-1 ${rx
                        ? "bg-blue-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                >
                    RX {rx && <Check className="w-4 h-4" />}
                </button>
                <span className="text-xs text-muted-foreground">
                    {rx ? "Peso y movimientos como prescrito" : "Marca si hiciste el bloque tal cual"}
                </span>
            </div>

            <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea
                    name="notes"
                    defaultValue={existingResult?.notes || ""}
                    placeholder="¿Cómo te fue? ¿Escalaste algún peso?"
                    rows={2}
                    className="resize-none"
                />
            </div>

            {error && (
                <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-500 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {existingResult ? "Score actualizado" : "Score registrado"} exitosamente.
                </div>
            )}

            <Button
                type="submit"
                isLoading={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold"
            >
                {loading
                    ? "Guardando..."
                    : existingResult
                        ? "Actualizar Score"
                        : "Registrar Score"}
            </Button>
        </form>
    );
}
