"use client";

import { useState } from "react";
import { logPersonalRecord } from "@/actions/prs";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import type { Movement } from "@/lib/types/database";

interface PrFormProps {
    movements: Movement[];
    trigger: React.ReactNode;
    defaultMovementId?: string;
}

export function PrForm({ movements, trigger, defaultMovementId }: PrFormProps) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = await logPersonalRecord(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setOpen(false);
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar PR</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Registra tu nuevo peso máximo.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Movimiento</Label>
                        <Select name="movement_id" defaultValue={defaultMovementId}>
                            <SelectTrigger className="border-zinc-700 bg-zinc-800/50 text-white">
                                <SelectValue placeholder="Selecciona un movimiento" />
                            </SelectTrigger>
                            <SelectContent className="border-zinc-700 bg-zinc-900 text-white max-h-60">
                                {movements.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>
                                        {m.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Peso (kg)</Label>
                            <Input
                                name="weight_value"
                                type="number"
                                step="0.5"
                                min="0"
                                placeholder="Ej: 100"
                                required
                                className="border-zinc-700 bg-zinc-800/50 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Reps</Label>
                            <Input
                                name="reps"
                                type="number"
                                min="1"
                                defaultValue="1"
                                className="border-zinc-700 bg-zinc-800/50 text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">Notas (opcional)</Label>
                        <Textarea
                            name="notes"
                            placeholder="¿Fue strict? ¿Con cinturón?"
                            rows={2}
                            className="border-zinc-700 bg-zinc-800/50 text-white resize-none"
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="text-zinc-400"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                        >
                            {loading ? "Guardando..." : "Guardar PR"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
