"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MoreVertical, Timer, Check, X, ArrowDownUp, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * FitMe Workout Tracker UI
 * Representa la interfaz interactiva mostrada en el mockup para iniciar y hacer seguimiento a una rutina.
 */
export function WorkoutTracker({ wod }: { wod: any }) {
    const router = useRouter();

    // Estado principal del entrenamiento
    const [durationSeconds, setDurationSeconds] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [notes, setNotes] = useState("");

    // Aplanar los bloques/movimientos manejando estado local
    // Initializamos las series basandonos en `m.reps` y un peso genérico si existe.
    const [blocks, setBlocks] = useState<any[]>(() => {
        const initial: any[] = [];
        const sections = (wod.wod_sections || []).sort((a: any, b: any) => a.order_index - b.order_index);

        sections.forEach((sec: any) => {
            const movs = sec.wod_section_movements?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
            if (movs.length === 0) {
                // Bloque sin movimientos
                initial.push({
                    id: sec.id,
                    type: "section",
                    title: sec.section_type,
                    description: sec.description,
                    sets: [{ id: 1, kg: 0, reps: 0, checked: false }]
                });
            } else {
                movs.forEach((m: any) => {
                    initial.push({
                        id: m.id,
                        type: "movement",
                        title: m.movements?.name || "Ejercicio general",
                        notes: m.notes || "",
                        rest: "2min 0s",
                        sets: [
                            { id: 1, kg: m.weight_kg || 0, reps: m.reps || 0, checked: false },
                            { id: 2, kg: m.weight_kg || 0, reps: m.reps || 0, checked: false },
                            { id: 3, kg: m.weight_kg || 0, reps: m.reps || 0, checked: false },
                        ]
                    });
                });
            }
        });
        return initial.length > 0 ? initial : [{ id: 'empty', type: 'section', title: 'Rutina Libre', sets: [{ id: 1, kg: 0, reps: 0, checked: false }] }];
    });


    // Timer
    useEffect(() => {
        if (isFinished) return;
        const interval = setInterval(() => {
            setDurationSeconds(s => s + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isFinished]);

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}min ${secs}s`;
    };

    // Cálculos en vivo
    const totalVolume = blocks.reduce((acc, block) => {
        const blockVol = block.sets.reduce((setAcc: number, set: any) => {
            if (set.checked) return setAcc + (set.kg * set.reps);
            return setAcc;
        }, 0);
        return acc + blockVol;
    }, 0);

    const totalSets = blocks.reduce((acc, block) => {
        return acc + block.sets.filter((s: any) => s.checked).length;
    }, 0);

    const handleSetChange = (blockId: string, setId: number, field: string, value: any) => {
        setBlocks(prev => prev.map(b => {
            if (b.id !== blockId) return b;
            return {
                ...b,
                sets: b.sets.map((s: any) => s.id === setId ? { ...s, [field]: value } : s)
            };
        }));
    };

    const addSet = (blockId: string) => {
        setBlocks(prev => prev.map(b => {
            if (b.id !== blockId) return b;
            const lastSet = b.sets[b.sets.length - 1];
            return {
                ...b,
                sets: [...b.sets, { id: Date.now(), kg: lastSet?.kg || 0, reps: lastSet?.reps || 0, checked: false }]
            };
        }));
    };

    const deleteBlock = (blockId: string) => {
        setBlocks(prev => prev.filter(b => b.id !== blockId));
    };

    // ====== PANTALLA: TERMINAR RUTINA ======
    if (isFinished) {
        return (
            <div className="fixed inset-0 bg-background z-50 flex flex-col md:max-w-md md:mx-auto md:border-x">
                {/* Header Terminar */}
                <div className="flex items-center justify-between p-4 border-b bg-card">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => setIsFinished(false)}>
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <h2 className="text-xl font-bold">Entreno</h2>
                    </div>
                    <Button
                        onClick={() => router.push("/")}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                    >
                        Guardar
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Sumario Final */}
                    <div className="flex justify-between items-center text-center px-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Duración</p>
                            <p className="font-mono text-lg font-bold">{formatTime(durationSeconds)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Volumen</p>
                            <p className="font-mono text-lg font-bold">{totalVolume.toLocaleString()} kg</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Series</p>
                            <p className="font-mono text-lg font-bold">{totalSets}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Fecha</p>
                            <p className="font-mono text-sm tracking-tight font-bold pt-1">
                                {new Date().toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" })}
                            </p>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descripción</p>
                        <textarea
                            className="w-full bg-transparent border-0 resize-none focus:ring-0 text-sm placeholder:text-muted-foreground/60 h-24"
                            placeholder="¿Cómo ha ido tu entrenamiento? Deja algunas notas aquí..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <Separator className="bg-border/50" />

                    {/* Ajustes Ficticios Mockup */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center py-3 cursor-pointer hover:bg-muted/30 px-2 rounded-lg transition-colors group">
                            <span className="font-medium text-[15px]">Ajustes de Rutina</span>
                            <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180 group-hover:text-foreground transition-colors" />
                        </div>
                        <Separator className="bg-border/50" />
                        <div className="flex justify-between items-center py-3 cursor-pointer hover:bg-muted/30 px-2 rounded-lg transition-colors group">
                            <span className="font-medium text-[15px]">Sincronizar con</span>
                            <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180 group-hover:text-foreground transition-colors" />
                        </div>
                        <Separator className="bg-border/50" />
                    </div>

                    <div className="pt-8 flex justify-center">
                        <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 font-medium">
                            Descartar Entreno
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ====== PANTALLA: TRACKER INTERACTIVO ======
    return (
        <div className="flex flex-col h-full md:max-w-md md:mx-auto md:border-x min-h-screen bg-background">
            {/* Cabecera Flotante */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2 hover:bg-muted/50">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <h2 className="text-xl font-bold">Entreno</h2>
                    </div>
                    <Button
                        onClick={() => setIsFinished(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-5 font-semibold shadow-sm"
                    >
                        Terminar
                    </Button>
                </div>

                {/* Sub-header vivo */}
                <div className="flex items-center gap-8 px-6 pb-4">
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Duración</p>
                        <p className="font-mono text-[15px] font-bold tracking-tight">{formatTime(durationSeconds)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Volumen</p>
                        <p className="font-mono text-[15px] font-bold tracking-tight">{totalVolume} kg</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Series</p>
                        <p className="font-mono text-[15px] font-bold tracking-tight">{totalSets}</p>
                    </div>
                </div>
            </div>

            {/* Lista de Registros */}
            <div className="flex-1 p-4 space-y-8 overflow-y-auto pb-40">
                {blocks.map((block) => (
                    <div key={block.id} className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
                                    {/* Avatar placeholder o letra */}
                                    <span className="text-xs font-bold text-muted-foreground">E</span>
                                </div>
                                <h3 className="font-bold text-[15px]">{block.title}</h3>
                            </div>

                            {/* Menú de Opciones */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full hover:bg-muted">
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-60 p-1 rounded-2xl shadow-xl bg-card border-border/50">
                                    <div className="flex flex-col gap-0.5">
                                        <Button variant="ghost" className="justify-start font-medium text-sm h-10 px-3 hover:bg-muted/50 rounded-xl">
                                            <ArrowDownUp className="w-4 h-4 mr-3 text-muted-foreground" /> Reordenar
                                        </Button>
                                        <Button variant="ghost" className="justify-start font-medium text-sm h-10 px-3 hover:bg-muted/50 rounded-xl">
                                            <RefreshCw className="w-4 h-4 mr-3 text-muted-foreground" /> Reemplazar Ejercicio
                                        </Button>
                                        <Button variant="ghost" className="justify-start font-medium text-sm h-10 px-3 hover:bg-muted/50 rounded-xl">
                                            <Layers className="w-4 h-4 mr-3 text-muted-foreground" /> Agregar a superserie
                                        </Button>
                                        <Separator className="my-1 bg-border/50" />
                                        <Button
                                            variant="ghost"
                                            onClick={() => deleteBlock(block.id)}
                                            className="justify-start font-medium text-sm h-10 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                        >
                                            <X className="w-4 h-4 mr-3" /> Eliminar ejercicio
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Notas y Rest Timer */}
                        <div className="space-y-3 px-1">
                            <input
                                className="w-full bg-transparent border-0 text-[13px] text-muted-foreground placeholder:text-muted-foreground/50 focus:ring-0 p-0"
                                placeholder="Agregar notas aquí..."
                                defaultValue={block.notes}
                            />
                            {block.rest && (
                                <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground font-medium">
                                    <Timer className="w-4 h-4 opacity-70" />
                                    <span>Temporizador de descanso: {block.rest}</span>
                                </div>
                            )}
                        </div>

                        {/* Series Table */}
                        <div className="space-y-1">
                            <div className="grid grid-cols-4 px-2 pb-2 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground text-center">
                                <span className="text-left">SERIE</span>
                                <span>kG</span>
                                <span>REPS</span>
                                <span className="flex justify-center"><Check className="w-4 h-4" /></span>
                            </div>

                            <div className="space-y-1_5">
                                {block.sets.map((set: any, idx: number) => (
                                    <div
                                        key={set.id}
                                        className={cn(
                                            "grid grid-cols-4 items-center gap-2 p-1 rounded-xl transition-colors",
                                            set.checked ? "bg-green-500/10" : "hover:bg-muted/30"
                                        )}
                                    >
                                        <div className="text-center font-mono font-bold text-muted-foreground/80">{idx + 1}</div>
                                        <div>
                                            <Input
                                                type="number"
                                                className="h-8 text-center bg-muted/20 border-0 font-mono font-bold"
                                                value={set.kg}
                                                onChange={(e) => handleSetChange(block.id, set.id, 'kg', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type="number"
                                                className="h-8 text-center bg-muted/20 border-0 font-mono font-bold"
                                                value={set.reps}
                                                onChange={(e) => handleSetChange(block.id, set.id, 'reps', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => handleSetChange(block.id, set.id, 'checked', !set.checked)}
                                                className={cn(
                                                    "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                                                    set.checked ? "bg-green-500 text-white shadow-sm shadow-green-500/20" : "bg-muted text-muted-foreground/30 hover:bg-muted-foreground/20"
                                                )}
                                            >
                                                <Check className="w-4 h-4" strokeWidth={set.checked ? 3 : 2} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button
                            variant="secondary"
                            onClick={() => addSet(block.id)}
                            className="w-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 shadow-none font-semibold rounded-xl h-10 mt-2"
                        >
                            + Agregar Serie
                        </Button>
                        <Separator className="mt-8 opacity-50 border-dashed" />
                    </div>
                ))}
            </div>
        </div>
    );
}
