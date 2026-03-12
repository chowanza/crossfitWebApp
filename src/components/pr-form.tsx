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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar PR</DialogTitle>
                    <DialogDescription>
                        Registra tu nuevo peso máximo.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Movimiento</Label>
                        <Select name="movement_id" defaultValue={defaultMovementId}>
                            <SelectTrigger className="bg-muted/50">
                                <SelectValue placeholder="Selecciona un movimiento" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
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
                            <Label>Peso (kg)</Label>
                            <Input
                                name="weight_value"
                                type="number"
                                step="0.5"
                                min="0"
                                placeholder="Ej: 100"
                                required
                                className="bg-muted/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Reps</Label>
                            <Input
                                name="reps"
                                type="number"
                                min="1"
                                defaultValue="1"
                                className="bg-muted/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Notas (opcional)</Label>
                        <Textarea
                            name="notes"
                            placeholder="¿Fue strict? ¿Con cinturón?"
                            rows={2}
                            className="bg-muted/50 resize-none"
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
                            className="text-muted-foreground"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isLoading={loading}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                        >
                            {loading ? "Guardando..." : "Guardar PR"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
