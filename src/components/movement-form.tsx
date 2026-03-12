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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Editar Movimiento" : "Nuevo Movimiento"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Modifica los datos." : "Agrega un movimiento al catálogo."}
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                            name="name"
                            defaultValue={movement?.name}
                            placeholder='Ej: "Back Squat"'
                            required
                            className="bg-muted/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Categoría</Label>
                        <Select name="category" defaultValue={movement?.category || "OTHER"}>
                            <SelectTrigger className="bg-muted/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                        {c.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea
                            name="description"
                            defaultValue={movement?.description}
                            placeholder="Descripción breve del movimiento"
                            rows={2}
                            className="bg-muted/50 resize-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>URL de Imagen/Video (Opcional)</Label>
                        <Input
                            name="media_url"
                            type="url"
                            defaultValue={movement?.media_url || ""}
                            placeholder="https://ejemplo.com/gif-del-ejercicio.gif"
                            className="bg-muted/50"
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-muted-foreground">
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isLoading={loading}
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
                        >
                            {loading ? "Guardando..." : isEdit ? "Guardar" : "Crear"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
