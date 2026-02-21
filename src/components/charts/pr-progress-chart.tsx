"use client";

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

interface PrProgressChartProps {
    records: (PersonalRecord & { movements: Pick<Movement, "name"> | null })[];
}

export function PrProgressChart({ records }: PrProgressChartProps) {
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

    // Tomar los 3 movimientos con más registros
    const topMovements = Object.entries(byMovement)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 3);

    const COLORS = ["#3b82f6", "#3b82f6", "#10b981"];

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
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                        label={{
                            value: "kg",
                            angle: -90,
                            position: "insideLeft",
                            style: { fill: "hsl(var(--muted-foreground))" },
                        }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--foreground))",
                        }}
                    />
                    <Legend
                        wrapperStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    {topMovements.map(([name], i) => (
                        <Line
                            key={name}
                            type="monotone"
                            dataKey={name}
                            stroke={COLORS[i]}
                            strokeWidth={2}
                            dot={{ r: 4, fill: COLORS[i] }}
                            connectNulls
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
