"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, CheckCircle2, ChevronDown, Clock, Dumbbell, Calendar as CalendarIcon, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createWod } from "@/actions/wods";
import type { SectionType } from "@/lib/types/database";
import type { WodDraft, WodSectionDraft, WodMovementDraft } from "@/lib/types/wod-builder";
import { createClient } from "@/lib/supabase/client";
import { AthleteWeightDialog } from "@/components/athlete-weight-dialog";

// DB Models
interface Movement {
    id: string;
    name: string;
}

const SECTION_TYPES: { value: SectionType; label: string; desc: string }[] = [
    { value: "AMRAP", label: "AMRAP", desc: "As Many Rounds As Possible" },
    { value: "EMOM", label: "EMOM", desc: "Every Minute On the Minute" },
    { value: "FOR_TIME", label: "For Time", desc: "Completar en el menor tiempo" },
    { value: "TABATA", label: "Tabata", desc: "Intervalos intensos" },
    { value: "STRENGTH", label: "Fuerza / RM", desc: "Levantamiento pesado" },
    { value: "CUSTOM", label: "Personalizado", desc: "Bloque a tu medida" },
];

export default function AdminWodBuilder() {
    const router = useRouter();
    const supabase = createClient();

    // Global Dependencies
    const [movementsDB, setMovementsDB] = useState<Movement[]>([]);
    const [athletesDB, setAthletesDB] = useState<{id: string, full_name: string}[]>([]);

    // Core Form State
    const [draft, setDraft] = useState<WodDraft>({
        title: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
        sections: [],
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch catalog on mount
    useEffect(() => {
        async function loadData() {
            const { data } = await supabase.from("movements").select("id, name").order("name");
            if (data) setMovementsDB(data);

            const { data: ath } = await supabase.from("profiles").select("id, full_name").eq("role", "USER").order("full_name");
            if (ath) setAthletesDB(ath);
        }
        loadData();
    }, []);

    // ===== MUTATORS =====
    const addSection = () => {
        const newSec: WodSectionDraft = {
            id: Date.now().toString(),
            type: "CUSTOM",
            order_index: draft.sections.length,
            time_cap_seconds: "",
            movements: [],
        };
        setDraft(prev => ({ ...prev, sections: [...prev.sections, newSec] }));
    };

    const updateSection = (id: string, field: keyof WodSectionDraft, value: any) => {
        setDraft(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === id ? { ...s, [field]: value } : s)
        }));
    };

    const removeSection = (id: string) => {
        setDraft(prev => ({
            ...prev,
            sections: prev.sections.filter(s => s.id !== id).map((s, i) => ({ ...s, order_index: i }))
        }));
    };

    const addMovement = (sectionId: string) => {
        setDraft(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id !== sectionId) return s;
                const newMov: WodMovementDraft = {
                    id: Date.now().toString(),
                    movement_id: movementsDB[0]?.id || "",
                    reps: "",
                    weight_kg: "",
                    order_index: s.movements.length,
                };
                return { ...s, movements: [...s.movements, newMov] };
            })
        }));
    };

    const updateMovement = (sectionId: string, movId: string, field: keyof WodMovementDraft, value: any) => {
        setDraft(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    movements: s.movements.map(m => m.id === movId ? { ...m, [field]: value } : m)
                };
            })
        }));
    };

    const removeMovement = (sectionId: string, movId: string) => {
        setDraft(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    movements: s.movements.filter(m => m.id !== movId).map((m, i) => ({ ...m, order_index: i }))
                };
            })
        }));
    };

    // ===== SUBMIT HANDLER =====
    const handleSave = async () => {
        setError(null);
        if (!draft.title) {
            return setError("El título de la rutina es obligatorio.");
        }

        setLoading(true);
        // Translate state to Server Action requirement
        const payload = {
            title: draft.title,
            date: draft.date,
            notes: draft.notes,
            sections: draft.sections.map(s => ({
                section_type: s.type,
                time_cap_seconds: typeof s.time_cap_seconds === "string" ? parseInt(s.time_cap_seconds) || null : s.time_cap_seconds || null,
                description: "", // Can be expanded in UI later
                order_index: s.order_index,
                movements: s.movements.map(m => ({
                    movement_id: m.movement_id,
                    reps: typeof m.reps === "string" ? parseInt(m.reps) || null : m.reps || null,
                    weight_kg: typeof m.weight_kg === "string" ? parseFloat(m.weight_kg) || null : m.weight_kg || null,
                    notes: "",
                    order_index: m.order_index,
                    athlete_weights: m.athlete_weights || [],
                }))
            }))
        };

        const res = await createWod(payload);
        if (res.error) {
            setError(res.error);
            setLoading(false);
        } else {
            router.push("/admin/wods");
            router.refresh();
        }
    };

    // ===== RENDER =====
    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-24">
            {/* Header / Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Creador de Rutinas</h1>
                    <p className="text-muted-foreground mt-1">
                        Estructura entrenamientos complejos por bloques y repeticiones.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={loading || draft.sections.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                    {loading ? "Guardando..." : "Guardar WOD"}
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20 font-medium">
                    {error}
                </div>
            )}

            {/* General Info */}
            <Card className="border-border shadow-sm">
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><AlignLeft className="w-4 h-4" /> Título del WOD</Label>
                            <Input
                                placeholder="Ej: Murph, Cindy, o General Workout"
                                value={draft.title}
                                onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Fecha Programada</Label>
                            <Input
                                type="date"
                                value={draft.date}
                                onChange={(e) => setDraft(prev => ({ ...prev, date: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Notas Generales / Instucciones del Coach</Label>
                        <Textarea
                            placeholder="Escribe recomendaciones técnicas, calentamientos u objetivos."
                            className="h-32 resize-none"
                            value={draft.notes}
                            onChange={(e) => setDraft(prev => ({ ...prev, notes: e.target.value }))}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* SECTIONS */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-indigo-600" /> Bloques de Ejercicios
                </h2>

                {draft.sections.map((section, sIdx) => (
                    <Card key={section.id} className="border-2 border-border/50 relative overflow-visible">
                        {/* Section Header */}
                        <div className="bg-muted/30 p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-t-xl">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="cursor-grab hover:text-indigo-600 transition-colors">
                                    <GripVertical className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div className="space-y-1 w-full md:w-fit">
                                    <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Tipo de Bloque</Label>
                                    <Select
                                        value={section.type}
                                        onValueChange={(val) => updateSection(section.id, 'type', val)}
                                    >
                                        <SelectTrigger className="w-full md:w-[200px] border-indigo-600/20 bg-background font-bold text-indigo-600">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SECTION_TYPES.map(t => (
                                                <SelectItem key={t.value} value={t.value}>
                                                    {t.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1 w-full md:w-32">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-tight font-semibold flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Time Cap (s)
                                    </Label>
                                    <Input
                                        type="number"
                                        placeholder="Ej: 600"
                                        value={section.time_cap_seconds || ""}
                                        onChange={(e) => updateSection(section.id, 'time_cap_seconds', e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                            </div>

                            <Button variant="ghost" size="icon" onClick={() => removeSection(section.id)} className="text-destructive hover:bg-destructive/10 shrink-0 hidden md:flex">
                                <Trash2 className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Movements Content */}
                        <div className="p-4 space-y-3">
                            {section.movements.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4 bg-muted/10 rounded-lg border border-dashed">
                                    No hay ejercicios en este bloque.
                                </p>
                            ) : (
                                <div className="grid grid-cols-[auto_1fr_80px_110px_auto] gap-3 items-center text-xs font-semibold text-muted-foreground px-2 mb-2">
                                    <div></div>
                                    <div>EJERCICIO</div>
                                    <div className="text-center">REPS/SEC</div>
                                    <div className="text-center pl-2">PESO (kg)</div>
                                    <div></div>
                                </div>
                            )}

                            {section.movements.map((mov, mIdx) => (
                                <div key={mov.id} className="grid grid-cols-[auto_1fr_80px_110px_auto] gap-3 items-center group bg-background p-2 rounded-lg border border-border hover:border-indigo-600/30 transition-colors">
                                    <div className="cursor-grab px-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <GripVertical className="w-4 h-4" />
                                    </div>

                                    <div className="relative">
                                        <Select
                                            value={mov.movement_id}
                                            onValueChange={(val) => updateMovement(section.id, mov.id, 'movement_id', val)}
                                        >
                                            <SelectTrigger className="w-full text-sm font-semibold truncate border-border/50 shadow-none">
                                                <SelectValue placeholder="Elegir ejercicio..." />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-60">
                                                {movementsDB.map(dbMov => (
                                                    <SelectItem key={dbMov.id} value={dbMov.id}>{dbMov.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Input
                                            type="number"
                                            placeholder="Ej: 15"
                                            className="h-9 text-center font-mono shadow-none"
                                            value={mov.reps}
                                            onChange={(e) => updateMovement(section.id, mov.id, 'reps', e.target.value)}
                                        />
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Input
                                            type="number"
                                            placeholder="Lbs/Kg"
                                            className="h-9 w-[60px] text-center font-mono shadow-none px-1"
                                            value={mov.weight_kg}
                                            onChange={(e) => updateMovement(section.id, mov.id, 'weight_kg', e.target.value)}
                                        />
                                        <AthleteWeightDialog 
                                            athletes={athletesDB}
                                            value={mov.athlete_weights || []}
                                            onChange={(weights) => updateMovement(section.id, mov.id, 'athlete_weights', weights)}
                                        />
                                    </div>

                                    <div>
                                        <Button variant="ghost" size="icon" onClick={() => removeMovement(section.id, mov.id)} className="h-8 w-8 text-destructive opacity-50 hover:bg-destructive/10 hover:opacity-100">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-2 flex justify-between items-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addMovement(section.id)}
                                    className="border-dashed border-2 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-600/5 transition-all text-xs font-semibold"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Ejercicio
                                </Button>
                                {/* Mobile delete block btn */}
                                <Button variant="ghost" size="sm" onClick={() => removeSection(section.id)} className="text-destructive md:hidden text-xs">
                                    Eliminar bloque
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}

                <Button
                    variant="outline"
                    onClick={addSection}
                    className="w-full h-14 border-dashed border-2 bg-muted/10 hover:bg-muted/30 text-muted-foreground hover:text-foreground font-bold transition-all text-base"
                >
                    <Plus className="w-5 h-5 mr-2" /> Añadir Nuevo Bloque
                </Button>
            </div>
        </div>
    );
}
