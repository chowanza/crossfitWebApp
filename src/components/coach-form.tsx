"use client";

import { useState } from "react";
import { createCoach, updateCoach } from "@/actions/coaches";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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

interface CoachFormProps {
    trigger: React.ReactNode;
    coach?: Pick<Profile, "id" | "full_name" | "is_active" | "weight_kg" | "height_cm" | "coach_schedule">;
}

export function CoachForm({ trigger, coach }: CoachFormProps) {
    const isEditing = !!coach;
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = isEditing
            ? await updateCoach(coach!.id, formData)
            : await createCoach(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            toast.success("Entrenador guardado exitosamente");
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
                        {isEditing ? "Editar Entrenador" : "Nuevo Entrenador"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Modifica los datos del entrenador."
                            : "Crea una cuenta para un nuevo entrenador (ADMIN)."}
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nombre completo</Label>
                        <Input
                            name="full_name"
                            placeholder="Ej: Pedro Entrenador"
                            defaultValue={coach?.full_name}
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Peso (kg)</Label>
                            <Input
                                name="weight_kg"
                                type="number"
                                step="0.1"
                                placeholder="Ej: 75"
                                defaultValue={coach?.weight_kg || ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Estatura (cm)</Label>
                            <Input
                                name="height_cm"
                                type="number"
                                placeholder="Ej: 175"
                                defaultValue={coach?.height_cm || ""}
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Horario de Clases</Label>
                        <Input
                            name="coach_schedule"
                            placeholder="Ej: Lunes a Viernes 7:00 AM - 12:00 PM"
                            defaultValue={coach?.coach_schedule || ""}
                        />
                    </div>

                    {!isEditing && (
                        <>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="coach@email.com"
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

                    {isEditing && (
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                            <div>
                                <Label htmlFor="is_active">Activo en la plataforma</Label>
                                <p className="text-xs text-muted-foreground mt-0.5">Permite o restringe su acceso</p>
                            </div>
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                value="true"
                                defaultChecked={coach?.is_active ?? true}
                                className="h-5 w-5 rounded border-input accent-indigo-600"
                            />
                        </div>
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
                            disabled={loading}
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
                        >
                            {loading
                                ? isEditing
                                    ? "Guardando..."
                                    : "Creando..."
                                : isEditing
                                    ? "Guardar"
                                    : "Crear Entrenador"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
