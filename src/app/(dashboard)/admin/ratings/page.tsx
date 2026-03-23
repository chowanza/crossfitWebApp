import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile, AppRating } from "@/lib/types/database";
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

interface RatingWithProfile extends AppRating {
    profiles: Pick<Profile, "full_name"> | null;
}

export default async function AdminRatingsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user!.id)
        .single();

    const profile = profileData as Pick<Profile, "role"> | null;
    if (profile?.role !== "ADMIN" && profile?.role !== "SUPERADMIN") redirect("/");

    // Todos los ratings
    const { data: ratingsData } = await supabase
        .from("app_ratings")
        .select("*, profiles(full_name)")
        .order("period", { ascending: false })
        .order("created_at", { ascending: false });

    const ratings = (ratingsData || []) as RatingWithProfile[];

    // Agrupar por período para la gráfica
    const byPeriod: Record<string, { total: number; count: number }> = {};
    ratings.forEach((r) => {
        if (!byPeriod[r.period]) byPeriod[r.period] = { total: 0, count: 0 };
        byPeriod[r.period].total += r.rating;
        byPeriod[r.period].count += 1;
    });

    const chartData = Object.entries(byPeriod)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, { total, count }]) => ({
            period,
            avg: Math.round((total / count) * 10) / 10,
            count,
        }));

    // Rating promedio global
    const globalAvg =
        ratings.length > 0
            ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
            : "—";

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Satisfacción de la App</h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Calificaciones mensuales de los atletas.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-border bg-muted/10 text-center">
                    <CardContent className="pt-6">
                        <p className="text-2xl font-bold text-indigo-600">{globalAvg}</p>
                        <p className="text-xs text-muted-foreground mt-1">Promedio ⭐</p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-muted/10 text-center">
                    <CardContent className="pt-6">
                        <p className="text-2xl font-bold text-indigo-600">{ratings.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total votos</p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-muted/10 text-center">
                    <CardContent className="pt-6">
                        <p className="text-2xl font-bold text-indigo-600">
                            {chartData.length}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Meses</p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfica */}
            <Card className="border-border bg-muted/10">
                <CardHeader>
                    <CardTitle className="text-base">📊 Satisfacción por Mes</CardTitle>
                </CardHeader>
                <CardContent>
                    <SatisfactionChart data={chartData} />
                </CardContent>
            </Card>

            {/* Tabla detalle */}
            {ratings.length > 0 && (
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
                            {ratings.slice(0, 30).map((r) => (
                                <TableRow key={r.id} className="border-border">
                                    <TableCell className="text-muted-foreground font-mono text-sm">
                                        {r.period}
                                    </TableCell>
                                    <TableCell className="text-foreground font-medium">
                                        {r.profiles?.full_name || "—"}
                                    </TableCell>
                                    <TableCell>
                                        {"⭐".repeat(r.rating)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm max-w-xs truncate hidden md:table-cell">
                                        {r.comment}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
