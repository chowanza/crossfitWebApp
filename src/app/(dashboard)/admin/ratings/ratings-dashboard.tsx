"use client";

import { useState, useMemo } from "react";
import type { AppRating, Profile } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SatisfactionChart } from "@/components/charts/satisfaction-chart";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface RatingWithProfile extends AppRating {
    profiles: Pick<Profile, "full_name"> | null;
}

interface RatingsDashboardProps {
    initialRatings: RatingWithProfile[];
}

export function RatingsDashboard({ initialRatings }: RatingsDashboardProps) {
    const [filterPeriod, setFilterPeriod] = useState<string>("all");
    const [filterRating, setFilterRating] = useState<string>("all");

    // Extraer períodos únicos para el selector
    const periods = useMemo(() => {
        const unique = Array.from(new Set(initialRatings.map((r) => r.period))).sort().reverse();
        return unique;
    }, [initialRatings]);

    // Filtrar ratings según los selectores
    const filteredRatings = useMemo(() => {
        return initialRatings.filter((r) => {
            const matchPeriod = filterPeriod === "all" || r.period === filterPeriod;
            const matchRating = filterRating === "all" || r.rating === parseInt(filterRating);
            return matchPeriod && matchRating;
        });
    }, [initialRatings, filterPeriod, filterRating]);

    // Datos para la gráfica (sobre TODOS los ratings, no filtrados por estrella)
    const chartData = useMemo(() => {
        const byPeriod: Record<string, { total: number; count: number }> = {};
        initialRatings.forEach((r) => {
            if (!byPeriod[r.period]) byPeriod[r.period] = { total: 0, count: 0 };
            byPeriod[r.period].total += r.rating;
            byPeriod[r.period].count += 1;
        });
        return Object.entries(byPeriod)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([period, { total, count }]) => ({
                period,
                avg: Math.round((total / count) * 10) / 10,
                count,
            }));
    }, [initialRatings]);

    // Stats globales (sobre filtrados)
    const globalAvg =
        filteredRatings.length > 0
            ? (filteredRatings.reduce((s, r) => s + r.rating, 0) / filteredRatings.length).toFixed(1)
            : "—";

    const hasFilters = filterPeriod !== "all" || filterRating !== "all";

    const clearFilters = () => {
        setFilterPeriod("all");
        setFilterRating("all");
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-border bg-muted/10 text-center">
                    <CardContent className="pt-5 pb-4">
                        <p className="text-2xl font-bold text-indigo-600">{globalAvg}</p>
                        <p className="text-xs text-muted-foreground mt-1">Promedio ⭐</p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-muted/10 text-center">
                    <CardContent className="pt-5 pb-4">
                        <p className="text-2xl font-bold text-indigo-600">{filteredRatings.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {hasFilters ? "Resultados" : "Total votos"}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-muted/10 text-center">
                    <CardContent className="pt-5 pb-4">
                        <p className="text-2xl font-bold text-indigo-600">{chartData.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">Meses</p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfica */}
            {chartData.length > 0 && (
                <Card className="border-border bg-muted/10">
                    <CardHeader>
                        <CardTitle className="text-base">📊 Satisfacción por Mes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SatisfactionChart data={chartData} />
                    </CardContent>
                </Card>
            )}

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border border-border/50 bg-muted/5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Filtrar:
                </span>

                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="h-9 w-[160px] bg-background text-sm">
                        <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los meses</SelectItem>
                        {periods.map((p) => (
                            <SelectItem key={p} value={p}>
                                {p}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filterRating} onValueChange={setFilterRating}>
                    <SelectTrigger className="h-9 w-[140px] bg-background text-sm">
                        <SelectValue placeholder="Estrellas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas ⭐</SelectItem>
                        {[5, 4, 3, 2, 1].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                                {"⭐".repeat(n)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {hasFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-9 px-2 text-muted-foreground hover:text-foreground gap-1"
                    >
                        <X className="h-4 w-4" />
                        Limpiar
                    </Button>
                )}

                {hasFilters && (
                    <span className="text-xs text-muted-foreground ml-auto">
                        {filteredRatings.length} de {initialRatings.length} resultados
                    </span>
                )}
            </div>

            {/* Tabla */}
            {filteredRatings.length > 0 ? (
                <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                                <TableHead className="text-muted-foreground">Período</TableHead>
                                <TableHead className="text-muted-foreground">Atleta</TableHead>
                                <TableHead className="text-muted-foreground">Rating</TableHead>
                                <TableHead className="text-muted-foreground hidden md:table-cell">
                                    Comentario
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRatings.map((r) => (
                                <TableRow key={r.id} className="border-border">
                                    <TableCell className="text-muted-foreground font-mono text-sm">
                                        {r.period}
                                    </TableCell>
                                    <TableCell className="text-foreground font-medium">
                                        {r.profiles?.full_name || "—"}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {"⭐".repeat(r.rating)}
                                        <span className="text-muted-foreground ml-1 text-xs">({r.rating}/5)</span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm max-w-xs truncate hidden md:table-cell">
                                        {r.comment || <span className="italic text-muted-foreground/40">Sin comentario</span>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="rounded-xl border border-border border-dashed py-12 flex flex-col items-center justify-center text-center bg-muted/5">
                    <p className="text-lg font-semibold">Sin resultados</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        No hay calificaciones con los filtros aplicados.
                    </p>
                    {hasFilters && (
                        <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                            Quitar filtros
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
