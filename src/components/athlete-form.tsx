"use client";

import { useState } from "react";
import { createAthlete, updateAthlete } from "@/actions/athletes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import type { Profile } from "@/lib/types/database";

interface AthleteFormProps {
    trigger: React.ReactNode;
    athlete?: Pick<Profile, "id" | "full_name" | "weight_kg" | "height_cm" | "is_active">;
}

export function AthleteForm({ trigger, athlete }: AthleteFormProps) {
    const isEditing = !!athlete;
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = isEditing
            ? await updateAthlete(athlete!.id, formData)
            : await createAthlete(formData);

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
                    <DialogTitle>
                        {isEditing ? "Editar Atleta" : "Nuevo Atleta"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Modifica los datos del atleta."
                            : "Crea una cuenta para un nuevo atleta."}
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nombre completo</Label>
                        <Input
                            name="full_name"
                            placeholder="Ej: Juan Pérez"
                            defaultValue={athlete?.full_name}
                            required
                        />
                    </div>

                    {!isEditing && (
                        <>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="atleta@email.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Contraseña</Label>
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    minLength={6}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Peso (kg)</Label>
                            <Input
                                name="weight_kg"
                                type="number"
                                step="0.1"
                                placeholder="Ej: 75"
                                defaultValue={athlete?.weight_kg ?? ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Altura (cm)</Label>
                            <Input
                                name="height_cm"
                                type="number"
                                step="0.1"
                                placeholder="Ej: 175"
                                defaultValue={athlete?.height_cm ?? ""}
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <input
                            type="hidden"
                            name="is_active"
                            value={athlete?.is_active ? "true" : "false"}
                        />
                    )}

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
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isLoading={loading}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                        >
                            {loading
                                ? isEditing
                                    ? "Guardando..."
                                    : "Creando..."
                                : isEditing
                                    ? "Guardar"
                                    : "Crear Atleta"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
