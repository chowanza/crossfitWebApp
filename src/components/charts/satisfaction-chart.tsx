"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface SatisfactionChartProps {
    data: { period: string; avg: number; count: number }[];
}

const getBarColor = (avg: number) => {
    if (avg >= 4.5) return "#22c55e";
    if (avg >= 3.5) return "#3b82f6";
    if (avg >= 2.5) return "#f97316";
    return "#ef4444";
};

export function SatisfactionChart({ data }: SatisfactionChartProps) {
    if (data.length === 0) {
        return (
            <div className="rounded-lg border border-border border-dashed py-8 text-center bg-muted/5">
                <p className="text-muted-foreground text-sm">Sin datos de satisfacción aún.</p>
            </div>
        );
    }

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                        dataKey="period"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                        domain={[0, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--foreground))",
                        }}
                        formatter={(value) => {
                            const v = Number(value);
                            return [`${v.toFixed(1)} ⭐`, "Promedio"];
                        }}
                        labelFormatter={(label) => {
                            const match = data.find((d) => d.period === label);
                            return match ? `${label} (${match.count} votos)` : label;
                        }}
                    />
                    <Bar dataKey="avg" radius={[4, 4, 0, 0]} maxBarSize={50}>
                        {data.map((entry, index) => (
                            <Cell key={index} fill={getBarColor(entry.avg)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
