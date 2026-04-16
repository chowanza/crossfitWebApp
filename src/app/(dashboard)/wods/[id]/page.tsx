/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Profile, ClassSession, WodSection, WodSectionMovement, Movement, WodResult } from "@/lib/types/database";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScoreForm } from "@/components/score-form";
import { ClassFeedbackForm } from "@/components/class-feedback-form";
import { MovementMediaDialog } from "@/components/movement-media-dialog";
import { MessageSquare, Star } from "lucide-react";

interface WodResultWithProfile extends WodResult {
    profiles: Pick<Profile, "full_name"> | null;
}

export default async function WodDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // WOD nested
    const { data: wodData } = await supabase
        .from("wods")
        .select(`
            *,
            wod_sections (
                *,
                wod_section_movements (
                    *,
                    movements (name, media_url)
                )
            )
        `)
        .eq("id", id)
        .single();

    if (!wodData) notFound();
    const wod = wodData as any;

    // Sort sections
    const sections = (wod.wod_sections || []).sort((a: any, b: any) => a.order_index - b.order_index);

    // Get section IDs to fetch all results
    const sectionIds = sections.map((s: any) => s.id);
    const movIds = sections.flatMap((s: any) => (s.wod_section_movements || []).map((m: any) => m.id));

    // Resultados p/ todas las secciones del WOD
    const { data: resultsData } = await supabase
        .from("wod_results")
        .select("*, profiles(full_name)")
        .in("section_id", sectionIds)
        .order("created_at", { ascending: true });

    const results = (resultsData || []) as WodResultWithProfile[];

    // Pesos personalizados
    const { data: customWeightsData } = movIds.length > 0 ? await supabase
        .from("athlete_wod_weights")
        .select("section_movement_id, weight_kg")
        .eq("athlete_id", user!.id)
        .in("section_movement_id", movIds) : { data: [] };
    
    const customWeights = customWeightsData || [];

    // Feedback del usuario
    const { data: feedbackData } = await supabase
        .from("class_sessions")
        .select("*")
        .eq("wod_id", id)
        .eq("user_id", user!.id)
        .single();

    const myFeedback = feedbackData as ClassSession | null;

    // Rating promedio
    const { data: allFeedback } = await supabase
        .from("class_sessions")
        .select("rating")
        .eq("wod_id", id);

    const feedbackList = (allFeedback || []) as { rating: number }[];
    const avgRating =
        feedbackList.length > 0
            ? (feedbackList.reduce((sum, f) => sum + f.rating, 0) / feedbackList.length).toFixed(1)
            : null;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* WOD Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-muted-foreground">{wod.date}</span>
                    {avgRating && (
                        <span className="text-sm text-muted-foreground">⭐ {avgRating}</span>
                    )}
                </div>
                <h2 className="text-3xl font-bold">{wod.title}</h2>
                {wod.notes && (
                    <p className="mt-2 text-muted-foreground font-medium">{wod.notes}</p>
                )}
            </div>

            <Separator />

            {/* SECTIONS */}
            <div className="space-y-8">
                {sections.length > 0 ? (
                    sections.map((sec: any, index: number) => {
                        // Movimientos
                        const movs = sec.wod_section_movements.sort((a: any, b: any) => a.order_index - b.order_index);

                        // Resultados para esta sección
                        const secResults = results.filter((r) => r.section_id === sec.id);
                        const myResult = secResults.find((r) => r.user_id === user?.id) || null;

                        return (
                            <div key={sec.id} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white font-bold">
                                        {index + 1}
                                    </div>
                                    <h3 className="text-xl font-bold uppercase tracking-wide">
                                        {sec.section_type.replace("_", " ")}
                                    </h3>
                                    {sec.time_cap_seconds && (
                                        <Badge variant="outline" className="border-indigo-600/50 text-indigo-600 bg-indigo-600/10">
                                            TC: {Math.floor(sec.time_cap_seconds / 60)} min
                                        </Badge>
                                    )}
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Bloque Info */}
                                    <Card className="flex flex-col">
                                        <CardHeader className="pb-3 bg-muted/30">
                                            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                                                Estructura
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4 flex-1">
                                            {sec.description && (
                                                <p className="font-medium mb-4">{sec.description}</p>
                                            )}

                                            {movs.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {movs.map((m: any) => {
                                                        const customWeight = customWeights.find(cw => cw.section_movement_id === m.id)?.weight_kg;
                                                        const finalWeight = customWeight !== undefined ? customWeight : m.weight_kg;
                                                        
                                                        return (
                                                        <li key={m.id} className="flex flex-col border-b last:border-0 pb-2 mb-2 last:mb-0 last:pb-0">
                                                            <div className="flex justify-between items-start">
                                                                <span className="font-semibold flex items-center gap-1.5">
                                                                    {m.reps ? `${m.reps}x ` : ""}
                                                                    {m.movements?.name || "Movimiento"}
                                                                    {m.movements?.media_url && (
                                                                        <MovementMediaDialog
                                                                            movementName={m.movements.name}
                                                                            mediaUrl={m.movements.media_url}
                                                                        />
                                                                    )}
                                                                </span>
                                                                {finalWeight !== null && (
                                                                    <span className={`text-sm px-2 py-0.5 rounded font-mono flex items-center gap-1 ${customWeight !== undefined ? "bg-indigo-600/10 text-indigo-700 border border-indigo-600/30" : "bg-muted"}`}>
                                                                        {finalWeight} kg 
                                                                        {customWeight !== undefined && <span className="text-[10px] font-bold uppercase text-indigo-600 ml-1" title="Asignado por tu coach">📋</span>}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {m.notes && (
                                                                <span className="text-xs text-muted-foreground italic mt-0.5">
                                                                    {m.notes}
                                                                </span>
                                                            )}
                                                        </li>
                                                    )})}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">
                                                    Ningún movimiento específico asignado.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Formulario Registro Score */}
                                    <Card className="flex flex-col">
                                        <CardHeader className="pb-3 bg-muted/30">
                                            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                                                {myResult ? "Tu Score Registrado" : "Registrar Score"}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4 flex-1">
                                            <ScoreForm wodId={wod.id} sectionId={sec.id} existingResult={myResult} />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Leaderboard Sección */}
                                <div className="pt-4">
                                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-widest">
                                        Leaderboard: Bloque {index + 1}
                                    </h4>
                                    {secResults.length > 0 ? (
                                        <div className="rounded-md border overflow-hidden text-sm">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-10">#</TableHead>
                                                        <TableHead>Atleta</TableHead>
                                                        <TableHead>Score</TableHead>
                                                        <TableHead>Tipo</TableHead>
                                                        <TableHead className="hidden sm:table-cell">Notas</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {secResults.map((r, i) => {
                                                        const isMe = r.user_id === user?.id;
                                                        return (
                                                            <TableRow key={r.id} className={isMe ? "bg-indigo-600/10" : ""}>
                                                                <TableCell className="text-muted-foreground font-mono">{i + 1}</TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`font-medium ${isMe ? "text-indigo-600" : ""}`}>
                                                                            {r.profiles?.full_name || "Atleta"}
                                                                        </span>
                                                                        {r.rx && <Badge className="h-4 px-1 text-[9px] bg-indigo-600">RX</Badge>}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="font-mono font-medium">{r.score_value}</TableCell>
                                                                <TableCell className="text-xs text-muted-foreground">{r.score_type}</TableCell>
                                                                <TableCell className="text-muted-foreground text-xs max-w-xs truncate hidden sm:table-cell">{r.notes}</TableCell>
                                                            </TableRow>
                                                        )
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-muted-foreground p-3 bg-muted/20 border border-dashed rounded text-center">
                                            Nadie ha registrado scores p/ esta sección.
                                        </div>
                                    )}
                                </div>
                                <Separator className="my-8" />
                            </div>
                        );
                    })
                ) : (
                    <div className="p-8 text-center border border-dashed rounded-lg bg-muted/10">
                        <p className="text-muted-foreground">Este WOD no tiene bloques asignados.</p>
                    </div>
                )}
            </div>

            {/* Feedback Global */}
            <Card className="border-border/50 bg-muted/10">
                <CardHeader className="pb-3 border-b border-border/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                        Feedback del Día
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <ClassFeedbackForm
                        wodId={wod.id}
                        existingRating={myFeedback?.rating}
                        existingComment={myFeedback?.comment}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
