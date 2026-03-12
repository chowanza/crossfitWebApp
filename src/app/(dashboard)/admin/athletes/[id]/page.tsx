import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile, PersonalRecord, Movement } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PrProgressChart } from "@/components/charts/pr-progress-chart";
import { WodActivityChart } from "@/components/charts/wod-activity-chart";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AthleteProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    // Verificamos si es ADMIN el que está viendo
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (currentUserProfile?.role !== "ADMIN") {
        redirect("/");
    }

    // Buscamos el perfil del atleta
    const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .eq("role", "USER")
        .single();

    const profile = data as Profile | null;

    if (!profile) {
        return (
            <div className="space-y-6">
                <Link href="/admin/athletes">
                    <Button variant="ghost" className="mb-2 -ml-4 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a la lista
                    </Button>
                </Link>
                <p className="text-center p-8 text-muted-foreground">No se encontró el perfil del atleta.</p>
            </div>
        );
    }

    // Stats
    const { count: totalWods } = await supabase
        .from("wod_results")
        .select("*", { count: "exact", head: true })
        .eq("user_id", id);

    const { count: totalPrs } = await supabase
        .from("personal_records")
        .select("*", { count: "exact", head: true })
        .eq("user_id", id);

    // PRs con movimiento para la gráfica
    const { data: prsData } = await supabase
        .from("personal_records")
        .select("*, movements(name)")
        .eq("user_id", id)
        .order("created_at", { ascending: true });

    const prs = (prsData || []) as (PersonalRecord & {
        movements: Pick<Movement, "name"> | null;
    })[];

    // Actividad de WODs por semana (últimas 8 semanas)
    const { data: wodResultsData } = await supabase
        .from("wod_results")
        .select("created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: true });

    const wodResults = (wodResultsData || []) as { created_at: string }[];

    // Agrupar por semana
    const weeklyData: Record<string, number> = {};
    wodResults.forEach((r) => {
        const date = new Date(r.created_at);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const key = weekStart.toLocaleDateString("es-VE", {
            day: "2-digit",
            month: "short",
        });
        weeklyData[key] = (weeklyData[key] || 0) + 1;
    });

    const activityData = Object.entries(weeklyData)
        .slice(-8)
        .map(([week, count]) => ({ week, count }));

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <Link href="/admin/athletes">
                <Button variant="ghost" className="mb-2 -ml-4 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Atletas
                </Button>
            </Link>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {profile.avatar_url ? (
                        <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-indigo-600/20">
                            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-xl font-black text-white shadow-sm">
                            {profile.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase() || "?"}
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold">{profile.full_name || "Atleta"}</h2>
                        <Badge
                            variant="outline"
                            className="border-muted-foreground/30 text-muted-foreground mt-1"
                        >
                            Atleta
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-border bg-muted/10 text-center">
                    <CardContent className="pt-6">
                        <p className="text-2xl font-bold text-indigo-600">{totalWods ?? 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">WODs</p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-muted/10 text-center">
                    <CardContent className="pt-6">
                        <p className="text-2xl font-bold text-indigo-600">{totalPrs ?? 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">PRs</p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-muted/10 text-center">
                    <CardContent className="pt-6">
                        <p className="text-2xl font-bold text-indigo-600">
                            {profile.is_active ? "✓" : "✗"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {profile.is_active ? "Activo" : "Inactivo"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Gráfica de Progreso PRs */}
            <Card className="border-border bg-muted/10">
                <CardHeader>
                    <CardTitle className="text-base">📈 Progreso de PRs</CardTitle>
                </CardHeader>
                <CardContent>
                    <PrProgressChart records={prs} />
                </CardContent>
            </Card>

            {/* Gráfica de Actividad */}
            <Card className="border-border bg-muted/10">
                <CardHeader>
                    <CardTitle className="text-base">🏃 Actividad Semanal</CardTitle>
                </CardHeader>
                <CardContent>
                    <WodActivityChart data={activityData} />
                </CardContent>
            </Card>

            <Separator />

            {/* Info */}
            <Card className="border-border bg-muted/10">
                <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Peso</p>
                            <p className="text-lg font-medium">
                                {profile.weight_kg ? `${profile.weight_kg} kg` : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Altura</p>
                            <p className="text-lg font-medium">
                                {profile.height_cm ? `${profile.height_cm} cm` : "—"}
                            </p>
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <p className="text-sm text-muted-foreground">Último pago</p>
                        <p className="text-lg font-medium">
                            {profile.last_payment_date ?? "Sin registro"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Miembro desde</p>
                        <p className="text-lg font-medium">
                            {new Date(profile.created_at).toLocaleDateString("es-VE", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
