"use client";

import { useState } from "react";
import { updateProfile } from "@/actions/profile";
import type { Profile } from "@/lib/types/database";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Loader2 } from "lucide-react";

export function ProfileEditDialog({ profile }: { profile: Profile }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        full_name: profile.full_name || "",
        weight_kg: profile.weight_kg?.toString() || "",
        height_cm: profile.height_cm?.toString() || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await updateProfile(formData);

        if (res?.error) {
            setError(res.error);
            setLoading(false);
        } else {
            setLoading(false);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 border-blue-500/30 text-blue-500 hover:text-blue-600 hover:border-blue-500/50 hover:bg-blue-500/10">
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Editar Perfil</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                    <DialogDescription>
                        Actualiza tu información personal. Los cambios se reflejarán instantáneamente.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Nombre Completo</Label>
                        <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            placeholder="Ej. Luis Pérez"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="weight_kg">Peso (kg)</Label>
                            <Input
                                id="weight_kg"
                                type="number"
                                step="0.1"
                                value={formData.weight_kg}
                                onChange={(e) => setFormData(prev => ({ ...prev, weight_kg: e.target.value }))}
                                placeholder="Ej. 75.5"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height_cm">Altura (cm)</Label>
                            <Input
                                id="height_cm"
                                type="number"
                                step="any"
                                value={formData.height_cm}
                                onChange={(e) => setFormData(prev => ({ ...prev, height_cm: e.target.value }))}
                                placeholder="Ej. 180"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="pt-2 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
