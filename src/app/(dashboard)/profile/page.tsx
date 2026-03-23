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

    // Actividad de WODs (Historial completo)
    const { data: wodResultsData } = await supabase
        .from("wod_results")
        .select("*, wods(title, date)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wodActivity = (wodResultsData || []) as any[];

    return (
        <div className="max-w-2xl mx-auto space-y-8">
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
                        <h2 className="text-2xl font-bold">{profile.full_name || "Usuario"}</h2>
                        <Badge
                            variant="outline"
                            className={
                                profile.role === "ADMIN"
                                    ? "border-indigo-600/30 text-indigo-600"
                                    : "border-muted-foreground/30 text-muted-foreground"
                            }
                        >
                            {["ADMIN", "SUPERADMIN"].includes(profile.role) ? "Entrenador" : "Atleta"}
                        </Badge>
                    </div>
                </div>
                <ProfileEditDialog profile={profile} />
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

            {/* Historial de Actividad */}
            <Card className="border-border bg-muted/10">
                <CardHeader>
                    <CardTitle className="text-base">📅 Historial de WODs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                        {wodActivity.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                Completa WODs para ver tu actividad aquí.
                            </p>
                        ) : (
                            wodActivity.map((record) => (
                                <div key={record.id} className="p-3 rounded-lg border border-border bg-card hover:border-indigo-500/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-semibold text-sm line-clamp-1 pr-4">
                                            {record.wods?.title || "WOD Eliminado"}
                                        </div>
                                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(record.created_at).toLocaleDateString("es-VE", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric"
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-indigo-400 font-bold">{record.score}</span>
                                        {record.is_rx && (
                                            <Badge variant="outline" className="text-[10px] h-4 leading-none border-amber-500 text-amber-500 bg-amber-500/10 px-1 py-0 rounded">RX</Badge>
                                        )}
                                    </div>
                                    {record.notes && (
                                        <p className="text-xs text-muted-foreground mt-2 italic border-l-2 border-indigo-500/30 pl-2">
                                            "{record.notes}"
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
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
