"use client";

import { useState } from "react";
import { Users, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AthleteWeightDialogProps {
    athletes: { id: string; full_name: string }[];
    value: { athlete_id: string; weight_kg: number | string }[];
    onChange: (weights: { athlete_id: string; weight_kg: number | string }[]) => void;
}

export function AthleteWeightDialog({ athletes, value = [], onChange }: AthleteWeightDialogProps) {
    const [open, setOpen] = useState(false);
    const [localOverrides, setLocalOverrides] = useState<{ [key: string]: string | number }>(() => {
        const initial: { [key: string]: string | number } = {};
        value.forEach(v => {
            initial[v.athlete_id] = v.weight_kg;
        });
        return initial;
    });

    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            // sync with upstream
            const current: { [key: string]: string | number } = {};
            value.forEach(v => {
                current[v.athlete_id] = v.weight_kg;
            });
            setLocalOverrides(current);
        }
        setOpen(isOpen);
    };

    const handleSave = () => {
        const newArray = Object.entries(localOverrides)
            .filter(([_, weight]) => weight !== "" && weight !== null && !isNaN(Number(weight)))
            .map(([athlete_id, weight]) => ({
                athlete_id,
                weight_kg: Number(weight),
            }));
        onChange(newArray);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-600/10 relative">
                    <Users className="w-4 h-4" />
                    {value.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                            {value.length}
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] flex flex-col gap-0 p-0 sm:max-w-[425px]">
                <DialogHeader className="px-5 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        Pesos Personalizados
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Asigna un peso específico solo a los atletas que no harán el peso RX.
                    </p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {athletes.map(ath => (
                        <div key={ath.id} className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium">{ath.full_name}</span>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="Peso (Kg/Lbs)"
                                    className="w-24 h-8 text-right font-mono"
                                    value={localOverrides[ath.id] || ""}
                                    onChange={e => setLocalOverrides(prev => ({ ...prev, [ath.id]: e.target.value }))}
                                />
                            </div>
                        </div>
                    ))}
                    {athletes.length === 0 && (
                        <p className="text-sm text-center text-muted-foreground py-4">No hay atletas registrados aún.</p>
                    )}
                </div>

                <div className="p-4 border-t flex justify-end gap-2 bg-muted/20">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 font-semibold gap-2">
                        <Save className="w-4 h-4" />
                        Guardar ({Object.values(localOverrides).filter(v => v !== "").length})
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
