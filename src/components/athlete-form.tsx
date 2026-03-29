"use client";

import { useState } from "react";
import { createAthlete, updateAthlete } from "@/actions/athletes";
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

interface AthleteFormProps {
    trigger: React.ReactNode;
    athlete?: Pick<Profile, "id" | "full_name" | "weight_kg" | "height_cm" | "is_active" | "cedula" | "phone" | "birth_date">;
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
            toast.error(result.error);
            setLoading(false);
        } else {
            const successMessage = isEditing
                ? "Perfil de atleta actualizado exitosamente."
                : "Atleta creado exitosamente.";
            toast.success(successMessage);
            setOpen(false);
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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

                    {/* Sección: Identidad */}
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-1">
                            Datos de Identidad
                        </p>
                        <div className="space-y-2">
                            <Label>Nombre completo <span className="text-red-400">*</span></Label>
                            <Input
                                name="full_name"
                                placeholder="Ej: Juan Pérez"
                                defaultValue={athlete?.full_name}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Cédula de Identidad</Label>
                                <Input
                                    name="cedula"
                                    placeholder="Ej: V-12345678"
                                    defaultValue={athlete?.cedula ?? ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Teléfono / WhatsApp</Label>
                                <Input
                                    name="phone"
                                    type="tel"
                                    placeholder="Ej: 0414-1234567"
                                    defaultValue={athlete?.phone ?? ""}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Fecha de Nacimiento</Label>
                            <Input
                                name="birth_date"
                                type="date"
                                defaultValue={athlete?.birth_date ?? ""}
                                className="[color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Sección: Acceso (solo al crear) */}
                    {!isEditing && (
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-1">
                                Credenciales de Acceso
                            </p>
                            <div className="space-y-2">
                                <Label>Email <span className="text-red-400">*</span></Label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="atleta@email.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Contraseña <span className="text-red-400">*</span></Label>
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    minLength={6}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {isEditing && (
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-1">
                                Seguridad
                            </p>
                            <div className="space-y-2">
                                <Label>Nueva Contraseña (opcional)</Label>
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="Dejar en blanco para mantener la actual"
                                    minLength={6}
                                />
                            </div>
                        </div>
                    )}

                    {/* Sección: Físico */}
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-1">
                            Datos Físicos
                        </p>
                        <div className="grid grid-cols-2 gap-3">
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
                    </div>

                    {isEditing && (
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                            <div>
                                <Label htmlFor="is_active">Activo en la plataforma</Label>
                                <p className="text-xs text-muted-foreground mt-0.5">Permite o restringe su acceso al sistema</p>
                            </div>
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                value="true"
                                defaultChecked={athlete?.is_active ?? true}
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
                            isLoading={loading}
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
                        >
                            {loading
                                ? isEditing ? "Guardando..." : "Creando..."
                                : isEditing ? "Guardar" : "Crear Atleta"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
