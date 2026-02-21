import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Wod, WodResult, Profile } from "@/lib/types/database";
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

    // WOD
    const { data: wodData } = await supabase
        .from("wods")
        .select("*")
        .eq("id", id)
        .single();

    const wod = wodData as Wod | null;
    if (!wod) notFound();

    // Resultados con nombre del atleta (leaderboard)
    const { data: resultsData } = await supabase
        .from("wod_results")
        .select("*, profiles(full_name)")
        .eq("wod_id", id)
        .order("created_at", { ascending: true });

    const results = (resultsData || []) as WodResultWithProfile[];

    // Resultado del usuario actual
    const myResult = results.find((r) => r.user_id === user?.id) || null;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* WOD Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <Badge
                        variant="outline"
                        className="border-amber-500/30 text-amber-500"
                    >
                        {wod.wod_type.replace("_", " ")}
                    </Badge>
                    <span className="text-sm text-zinc-500">{wod.date}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">{wod.title}</h2>
            </div>

            {/* WOD Description */}
            <Card className="border-zinc-800 bg-zinc-900/50">
                <CardContent className="pt-6">
                    <pre className="text-zinc-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {wod.description}
                    </pre>
                </CardContent>
            </Card>

            <Separator className="bg-zinc-800" />

            {/* Score Form */}
            <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                    <CardTitle className="text-lg">
                        {myResult ? "📝 Actualizar tu Score" : "🏋️ Registrar tu Score"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScoreForm wodId={wod.id} existingResult={myResult} />
                </CardContent>
            </Card>

            <Separator className="bg-zinc-800" />

            {/* Leaderboard */}
            <div>
                <h3 className="text-lg font-semibold mb-4">🏆 Leaderboard</h3>
                {results.length > 0 ? (
                    <div className="rounded-lg border border-zinc-800 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                    <TableHead className="text-zinc-400 w-12">#</TableHead>
                                    <TableHead className="text-zinc-400">Atleta</TableHead>
                                    <TableHead className="text-zinc-400">Score</TableHead>
                                    <TableHead className="text-zinc-400">Tipo</TableHead>
                                    <TableHead className="text-zinc-400 hidden md:table-cell">
                                        Notas
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map((result, index) => {
                                    const isMe = result.user_id === user?.id;
                                    return (
                                        <TableRow
                                            key={result.id}
                                            className={`border-zinc-800 ${isMe ? "bg-amber-500/5" : ""
                                                }`}
                                        >
                                            <TableCell className="font-mono text-zinc-500">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`font-medium ${isMe ? "text-amber-500" : "text-white"
                                                            }`}
                                                    >
                                                        {result.profiles?.full_name || "Atleta"}
                                                    </span>
                                                    {result.rx && (
                                                        <Badge className="bg-amber-500 text-black text-[10px] px-1.5 py-0">
                                                            RX
                                                        </Badge>
                                                    )}
                                                    {isMe && (
                                                        <span className="text-xs text-zinc-500">(tú)</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-zinc-300 font-mono">
                                                {result.score_value}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs text-zinc-500">
                                                    {result.score_type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-zinc-500 text-sm max-w-xs truncate hidden md:table-cell">
                                                {result.notes}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="rounded-lg border border-zinc-800 border-dashed py-8 text-center">
                        <p className="text-zinc-500">
                            Nadie ha registrado su score aún. ¡Sé el primero! 💪
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
