"use client";

import { useState } from "react";
import { logWodResult } from "@/actions/results";
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

export function ScoreForm({ wodId, existingResult }: ScoreFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rx, setRx] = useState(existingResult?.rx ?? false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        setSuccess(false);

        formData.set("wod_id", wodId);
        formData.set("rx", rx.toString());

        const result = await logWodResult(formData);
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
                    <Label className="text-zinc-300">Tu Score</Label>
                    <Input
                        name="score_value"
                        defaultValue={existingResult?.score_value}
                        placeholder='Ej: "3:45", "150", "8+12"'
                        required
                        className="border-zinc-700 bg-zinc-800/50 text-white"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-zinc-300">Tipo</Label>
                    <Select
                        name="score_type"
                        defaultValue={existingResult?.score_type || "TIME"}
                    >
                        <SelectTrigger className="border-zinc-700 bg-zinc-800/50 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-700 bg-zinc-900 text-white">
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
                    className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${rx
                            ? "bg-amber-500 text-black"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                >
                    RX {rx ? "✓" : ""}
                </button>
                <span className="text-xs text-zinc-500">
                    {rx ? "Peso y movimientos como prescrito" : "Marca si hiciste el WOD como prescrito"}
                </span>
            </div>

            <div className="space-y-2">
                <Label className="text-zinc-300">Notas (opcional)</Label>
                <Textarea
                    name="notes"
                    defaultValue={existingResult?.notes || ""}
                    placeholder="¿Cómo te fue? ¿Modificaste algo?"
                    rows={2}
                    className="border-zinc-700 bg-zinc-800/50 text-white resize-none"
                />
            </div>

            {error && (
                <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
                    ✅ {existingResult ? "Score actualizado" : "Score registrado"} exitosamente.
                </div>
            )}

            <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
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
