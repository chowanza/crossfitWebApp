"use client";

import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import type { PersonalRecord, Movement } from "@/lib/types/database";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PrProgressChartProps {
    records: (PersonalRecord & { movements: Pick<Movement, "name"> | null })[];
}

export function PrProgressChart({ records }: PrProgressChartProps) {
    const [selectedMovement, setSelectedMovement] = useState<string>("all");

    if (records.length === 0) {
        return (
            <div className="rounded-lg border border-border border-dashed py-8 text-center">
                <p className="text-muted-foreground text-sm">
                    Registra PRs para ver tu progreso aquí.
                </p>
            </div>
        );
    }

    // Agrupar por movimiento
    const byMovement: Record<string, { date: string; weight: number }[]> = {};
    records.forEach((r) => {
        const name = r.movements?.name || "Desconocido";
        if (!byMovement[name]) byMovement[name] = [];
        byMovement[name].push({
            date: new Date(r.created_at).toLocaleDateString("es-VE", {
                day: "2-digit",
                month: "short",
            }),
            weight: r.weight_value,
        });
    });

    // Movimientos disponibles para el filtro
    const availableMovements = Object.keys(byMovement).sort();

    // Determinar qué movimientos renderizar
    let topMovements: [string, { date: string; weight: number }[]][] = [];

    if (selectedMovement === "all") {
        // Tomar los 3 movimientos con más registros
        topMovements = Object.entries(byMovement)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 3);
    } else if (byMovement[selectedMovement]) {
        topMovements = [[selectedMovement, byMovement[selectedMovement]]];
    }

    const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#14b8a6"];

    // Fusionar data en un formato para Recharts
    const allDates = new Set<string>();
    topMovements.forEach(([, data]) =>
        data.forEach((d) => allDates.add(d.date))
    );

    const chartData = Array.from(allDates).map((date) => {
        const point: Record<string, string | number> = { date };
        topMovements.forEach(([name, data]) => {
            const match = data.find((d) => d.date === date);
            if (match) point[name] = match.weight;
        });
        return point;
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Select value={selectedMovement} onValueChange={setSelectedMovement}>
                    <SelectTrigger className="w-[180px] h-8 text-xs bg-muted/20 border-border/50 shadow-none">
                        <SelectValue placeholder="Filtrar movimiento" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Principales (Top 3)</SelectItem>
                        {availableMovements.map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                            stroke="var(--color-muted-foreground)"
                        />
                        <YAxis
                            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                            stroke="var(--color-muted-foreground)"
                            label={{
                                value: "kg",
                                angle: -90,
                                position: "insideLeft",
                                style: { fill: "var(--color-muted-foreground)" },
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--color-card)",
                                border: "1px solid var(--color-border)",
                                borderRadius: "8px",
                                color: "var(--color-foreground)",
                            }}
                        />
                        <Legend
                            wrapperStyle={{ color: "var(--color-muted-foreground)", fontSize: 12 }}
                        />
                        {topMovements.map(([name], i) => (
                            <Line
                                key={name}
                                type="monotone"
                                dataKey={name}
                                stroke={COLORS[i % COLORS.length]}
                                strokeWidth={2}
                                dot={{ r: 4, fill: COLORS[i % COLORS.length] }}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
