"use client";

import { useState } from "react";
import { createWod, updateWod } from "@/actions/wods";
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
import type { Wod, WodType } from "@/lib/types/database";

interface WodFormProps {
    wod?: Wod;
    trigger: React.ReactNode;
}

const WOD_TYPES: { value: WodType; label: string }[] = [
    { value: "AMRAP", label: "AMRAP" },
    { value: "EMOM", label: "EMOM" },
    { value: "FOR_TIME", label: "For Time" },
    { value: "TABATA", label: "Tabata" },
    { value: "CUSTOM", label: "Custom" },
];

export function WodForm({ wod, trigger }: WodFormProps) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isEdit = !!wod;

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = isEdit
            ? await updateWod(wod!.id, formData)
            : await createWod(formData);

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
            <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Editar WOD" : "Crear WOD"}</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        {isEdit
                            ? "Modifica los datos del WOD."
                            : "Define la rutina del día para tus atletas."}
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Título</Label>
                        <Input
                            name="title"
                            defaultValue={wod?.title}
                            placeholder='Ej: "Fran", "Murph", "WOD del día"'
                            required
                            className="border-zinc-700 bg-zinc-800/50 text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Tipo</Label>
                            <Select name="wod_type" defaultValue={wod?.wod_type || "CUSTOM"}>
                                <SelectTrigger className="border-zinc-700 bg-zinc-800/50 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-700 bg-zinc-900 text-white">
                                    {WOD_TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Fecha</Label>
                            <Input
                                name="date"
                                type="date"
                                defaultValue={wod?.date || new Date().toISOString().split("T")[0]}
                                className="border-zinc-700 bg-zinc-800/50 text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">Descripción</Label>
                        <Textarea
                            name="description"
                            defaultValue={wod?.description}
                            placeholder="Describe la rutina, rondas, movimientos, pesos..."
                            rows={5}
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
                            {loading
                                ? "Guardando..."
                                : isEdit
                                    ? "Guardar cambios"
                                    : "Crear WOD"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
