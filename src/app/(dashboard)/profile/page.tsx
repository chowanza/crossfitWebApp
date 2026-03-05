import { createClient } from "@/lib/supabase/server";
import type { Profile, PersonalRecord, Movement } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PrProgressChart } from "@/components/charts/pr-progress-chart";
import { WodActivityChart } from "@/components/charts/wod-activity-chart";
import { ProfileEditDialog } from "@/components/profile-edit-dialog";

export default async function ProfilePage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();

    const profile = data as Profile | null;

    if (!profile) {
        return <p className="text-muted-foreground">No se pudo cargar el perfil.</p>;
    }

    // Stats
    const { count: totalWods } = await supabase
        .from("wod_results")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);

    const { count: totalPrs } = await supabase
        .from("personal_records")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);

    // PRs con movimiento para la gráfica
    const { data: prsData } = await supabase
        .from("personal_records")
        .select("*, movements(name)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });

    const prs = (prsData || []) as (PersonalRecord & {
        movements: Pick<Movement, "name"> | null;
    })[];

    // Actividad de WODs por semana (últimas 8 semanas)
    const { data: wodResultsData } = await supabase
        .from("wod_results")
        .select("created_at")
        .eq("user_id", user!.id)
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xl font-black text-white">
                        {profile.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || "?"}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{profile.full_name || "Usuario"}</h2>
                        <Badge
                            variant="outline"
                            className={
                                profile.role === "ADMIN"
                                    ? "border-blue-500/30 text-blue-500"
                                    : "border-muted-foreground/30 text-muted-foreground"
                            }
                        >
                            {profile.role === "ADMIN" ? "Entrenador" : "Atleta"}
                        </Badge>
                    </div>
                </div>
                <ProfileEditDialog profile={profile} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-border bg-muted/10 text-center">
                    <CardContent className="pt-6">
                        <p className="text-2xl font-bold text-blue-500">{totalWods ?? 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">WODs</p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-muted/10 text-center">
                    <CardContent className="pt-6">
                        <p className="text-2xl font-bold text-blue-500">{totalPrs ?? 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">PRs</p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-muted/10 text-center">
                    <CardContent className="pt-6">
                        <p className="text-2xl font-bold text-blue-500">
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
