"use client";

import { useState } from "react";
import { createMovement, updateMovement } from "@/actions/movements";
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
import type { Movement, MovementCategory } from "@/lib/types/database";

interface MovementFormProps {
    movement?: Movement;
    trigger: React.ReactNode;
}

const CATEGORIES: { value: MovementCategory; label: string }[] = [
    { value: "WEIGHTLIFTING", label: "Halterofilia" },
    { value: "GYMNASTICS", label: "Gimnásticos" },
    { value: "CARDIO", label: "Cardio" },
    { value: "OTHER", label: "Otros" },
];

export function MovementForm({ movement, trigger }: MovementFormProps) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const isEdit = !!movement;

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = isEdit
            ? await updateMovement(movement!.id, formData)
            : await createMovement(formData);

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
                    <DialogTitle>{isEdit ? "Editar Movimiento" : "Nuevo Movimiento"}</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        {isEdit ? "Modifica los datos." : "Agrega un movimiento al catálogo."}
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Nombre</Label>
                        <Input
                            name="name"
                            defaultValue={movement?.name}
                            placeholder='Ej: "Back Squat"'
                            required
                            className="border-zinc-700 bg-zinc-800/50 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Categoría</Label>
                        <Select name="category" defaultValue={movement?.category || "OTHER"}>
                            <SelectTrigger className="border-zinc-700 bg-zinc-800/50 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-zinc-700 bg-zinc-900 text-white">
                                {CATEGORIES.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                        {c.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Descripción</Label>
                        <Textarea
                            name="description"
                            defaultValue={movement?.description}
                            placeholder="Descripción breve del movimiento"
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
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400">
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                        >
                            {loading ? "Guardando..." : isEdit ? "Guardar" : "Crear"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
