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
import type { Movement, SectionType } from "@/lib/types/database";
import { Plus, Trash2, ListPlus } from "lucide-react";

// Define the incoming nested WOD structure
interface NestedWod {
    id: string;
    date: string;
    title: string;
    notes: string;
    wod_sections: {
        id: string;
        section_type: SectionType;
        time_cap_seconds: number | null;
        description: string;
        order_index: number;
        wod_section_movements: {
            movement_id: string;
            reps: number | null;
            weight_kg: number | null;
            notes: string;
            order_index: number;
        }[];
    }[];
}

interface WodFormProps {
    wod?: NestedWod;
    movements: Movement[];
    trigger: React.ReactNode;
}

// Temporary state types for the form
interface TempMovement {
    movement_id: string;
    reps: number | null;
    weight_kg: number | null;
    notes: string;
    order_index: number;
}

interface TempSection {
    section_type: SectionType;
    time_cap_seconds: number | null;
    description: string;
    order_index: number;
    movements: TempMovement[];
}

const SECTION_TYPES: { value: SectionType; label: string }[] = [
    { value: "AMRAP", label: "AMRAP (Max Rondas/Reps)" },
    { value: "FOR_TIME", label: "For Time (Por Tiempo)" },
    { value: "EMOM", label: "EMOM (Cada Minuto)" },
    { value: "TABATA", label: "Tabata (Intervalos)" },
    { value: "STRENGTH", label: "Strength (Fuerza/Levantamiento)" },
    { value: "CUSTOM", label: "Custom (Personalizado)" },
];

export function WodForm({ wod, movements, trigger }: WodFormProps) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isEdit = !!wod;

    // Initial state logic
    const initialSections = isEdit
        ? wod.wod_sections
            .sort((a, b) => a.order_index - b.order_index)
            .map((s) => ({
                section_type: s.section_type,
                time_cap_seconds: s.time_cap_seconds,
                description: s.description || "",
                order_index: s.order_index,
                movements: (s.wod_section_movements || [])
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((m) => ({
                        movement_id: m.movement_id,
                        reps: m.reps,
                        weight_kg: m.weight_kg,
                        notes: m.notes || "",
                        order_index: m.order_index,
                    })),
            }))
        : [];

    const [title, setTitle] = useState(wod?.title || "");
    const [date, setDate] = useState(
        wod?.date || new Date().toISOString().split("T")[0]
    );
    const [notes, setNotes] = useState(wod?.notes || "");
    const [sections, setSections] = useState<TempSection[]>(initialSections);

    function addSection() {
        setSections([
            ...sections,
            {
                section_type: "CUSTOM",
                time_cap_seconds: null,
                description: "",
                order_index: sections.length,
                movements: [],
            },
        ]);
    }

    function removeSection(index: number) {
        const newSections = sections.filter((_, i) => i !== index);
        setSections(newSections.map((s, i) => ({ ...s, order_index: i })));
    }

    function updateSection(index: number, updates: Partial<TempSection>) {
        const newSections = [...sections];
        newSections[index] = { ...newSections[index], ...updates };
        setSections(newSections);
    }

    function addMovement(sectionIndex: number) {
        if (movements.length === 0) return;
        const sec = sections[sectionIndex];
        updateSection(sectionIndex, {
            movements: [
                ...sec.movements,
                {
                    movement_id: movements[0].id,
                    reps: null,
                    weight_kg: null,
                    notes: "",
                    order_index: sec.movements.length,
                },
            ],
        });
    }

    function removeMovement(sectionIndex: number, movIndex: number) {
        const sec = sections[sectionIndex];
        const newMovs = sec.movements.filter((_, i) => i !== movIndex);
        updateSection(sectionIndex, {
            movements: newMovs.map((m, i) => ({ ...m, order_index: i })),
        });
    }

    function updateMovement(
        sectionIndex: number,
        movIndex: number,
        updates: Partial<TempMovement>
    ) {
        const sec = sections[sectionIndex];
        const newMovs = [...sec.movements];
        newMovs[movIndex] = { ...newMovs[movIndex], ...updates };
        updateSection(sectionIndex, { movements: newMovs });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (sections.length === 0) {
            setError("Debes agregar al menos un bloque al WOD.");
            setLoading(false);
            return;
        }

        const payload = {
            title,
            date,
            notes,
            sections,
        };

        const result = isEdit
            ? await updateWod(wod!.id, payload)
            : await createWod(payload);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setOpen(false);
            setLoading(false);
            if (!isEdit) {
                // Reset form on success if creating
                setTitle("");
                setNotes("");
                setSections([]);
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle>{isEdit ? "Editar WOD" : "Crear WOD"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Modifica el WOD y sus bloques."
                            : "Define las secciones (AMRAP, FOR TIME...) y movimientos del día."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
                        {/* WOD Header */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Título del WOD</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder='Ej: "Fran" o "WOD del día"'
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha</Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Notas Generales (Opcional)</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Explicación general, calentamiento, etc."
                                rows={2}
                                className="resize-none"
                            />
                        </div>

                        {/* SECTIONS */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <ListPlus className="w-5 h-5 text-indigo-600" />
                                    Bloques del WOD
                                </h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-dashed"
                                    onClick={addSection}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Agregar Bloque
                                </Button>
                            </div>

                            {sections.length === 0 ? (
                                <div className="text-center p-8 border border-dashed rounded-lg bg-muted/20 flex flex-col items-center justify-center">
                                    <ListPlus className="w-8 h-8 text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground text-sm font-medium">
                                        No hay bloques configurados.
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Un WOD debe tener al menos un bloque (ej: un AMRAP).
                                    </p>
                                </div>
                            ) : (
                                sections.map((section, sIndex) => (
                                    <div
                                        key={sIndex}
                                        className="border rounded-lg p-4 bg-muted/10 space-y-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-indigo-600">
                                                Bloque {sIndex + 1}
                                            </h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 px-2"
                                                onClick={() => removeSection(sIndex)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Eliminar bloque
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-xs">Tipo de Bloque *</Label>
                                                <Select
                                                    value={section.section_type}
                                                    onValueChange={(val) =>
                                                        updateSection(sIndex, {
                                                            section_type: val as SectionType,
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {SECTION_TYPES.map((t) => (
                                                            <SelectItem key={t.value} value={t.value}>
                                                                {t.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-xs">
                                                    Time Cap (min) - Opcional
                                                </Label>
                                                <Input
                                                    type="number"
                                                    placeholder="Ej: 15"
                                                    value={
                                                        section.time_cap_seconds
                                                            ? section.time_cap_seconds / 60
                                                            : ""
                                                    }
                                                    onChange={(e) =>
                                                        updateSection(sIndex, {
                                                            time_cap_seconds: e.target.value
                                                                ? parseInt(e.target.value) * 60
                                                                : null,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-4">
                                                <Label className="text-xs">Instrucciones / Estructura del Bloque</Label>
                                                <Input
                                                    placeholder="Ej: 21-15-9 repeticiones de..."
                                                    value={section.description}
                                                    onChange={(e) => updateSection(sIndex, { description: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* MOVEMENTS IN SECTION */}
                                        <div className="pt-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <Label className="text-sm font-semibold">
                                                    Movimientos
                                                </Label>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-7 text-xs"
                                                    onClick={() => addMovement(sIndex)}
                                                >
                                                    <Plus className="w-3 h-3 mr-1" /> Añadir Movimiento
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                {section.movements.map((mov, mIndex) => (
                                                    <div
                                                        key={mIndex}
                                                        className="flex flex-col md:flex-row gap-2 items-start md:items-center bg-background rounded border p-2"
                                                    >
                                                        <div className="w-full md:w-1/3">
                                                            <Select
                                                                value={mov.movement_id}
                                                                onValueChange={(val) =>
                                                                    updateMovement(sIndex, mIndex, {
                                                                        movement_id: val,
                                                                    })
                                                                }
                                                            >
                                                                <SelectTrigger className="h-8 text-xs">
                                                                    <SelectValue placeholder="Selecciona" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {movements.map((m) => (
                                                                        <SelectItem key={m.id} value={m.id}>
                                                                            {m.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="flex-1 flex gap-2 w-full">
                                                            <Input
                                                                type="number"
                                                                placeholder="Reps"
                                                                className="h-8 text-xs"
                                                                value={mov.reps || ""}
                                                                onChange={(e) =>
                                                                    updateMovement(sIndex, mIndex, {
                                                                        reps: e.target.value
                                                                            ? parseInt(e.target.value)
                                                                            : null,
                                                                    })
                                                                }
                                                            />
                                                            <Input
                                                                type="number"
                                                                step="0.1"
                                                                placeholder="Peso KG"
                                                                className="h-8 text-xs"
                                                                value={mov.weight_kg || ""}
                                                                onChange={(e) =>
                                                                    updateMovement(sIndex, mIndex, {
                                                                        weight_kg: e.target.value
                                                                            ? parseFloat(e.target.value)
                                                                            : null,
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                        <div className="w-full md:w-1/3 flex gap-2">
                                                            <Input
                                                                placeholder="Notas (Ej: Hombres/Mujeres)"
                                                                className="h-8 text-xs flex-1"
                                                                value={mov.notes}
                                                                onChange={(e) => updateMovement(sIndex, mIndex, { notes: e.target.value })}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-red-400 shrink-0"
                                                                onClick={() => removeMovement(sIndex, mIndex)}
                                                            >
                                                                ✕
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {section.movements.length === 0 && (
                                                    <p className="text-xs text-muted-foreground italic px-1">
                                                        Sin movimientos específicos (ej: correr 5k).
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t shrink-0 bg-background flex justify-end gap-3 rounded-b-lg">
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
                                ? "Guardando WOD..."
                                : isEdit
                                    ? "Guardar Cambios"
                                    : "Crear WOD"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
