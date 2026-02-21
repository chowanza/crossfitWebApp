import { createClient } from "@/lib/supabase/server";
import type { Profile, Wod } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();

    const profile = profileData as Profile | null;

    // WOD del día
    const today = new Date().toISOString().split("T")[0];
    const { data: todayWods } = await supabase
        .from("wods")
        .select("*")
        .eq("date", today)
        .order("created_at", { ascending: false });

    const wods = (todayWods || []) as Wod[];

    // Stats rápidas
    const { count: totalWods } = await supabase
        .from("wod_results")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);

    const { count: totalPrs } = await supabase
        .from("personal_records")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl md:text-3xl font-bold">
                    Hola, {profile?.full_name?.split(" ")[0] || "Atleta"} 👋
                </h2>
                <p className="text-zinc-400 mt-1">
                    {profile?.role === "ADMIN" ? "Panel de Entrenador" : "Tu centro de entrenamiento"}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardContent className="pt-6">
                        <p className="text-3xl font-bold text-amber-500">{totalWods ?? 0}</p>
                        <p className="text-sm text-zinc-400 mt-1">WODs completados</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardContent className="pt-6">
                        <p className="text-3xl font-bold text-amber-500">{totalPrs ?? 0}</p>
                        <p className="text-sm text-zinc-400 mt-1">PRs registrados</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardContent className="pt-6">
                        <p className="text-3xl font-bold text-amber-500">{wods.length}</p>
                        <p className="text-sm text-zinc-400 mt-1">WODs hoy</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardContent className="pt-6">
                        <p className="text-3xl font-bold text-amber-500">
                            {profile?.last_payment_date ?? "—"}
                        </p>
                        <p className="text-sm text-zinc-400 mt-1">Último pago</p>
                    </CardContent>
                </Card>
            </div>

            {/* WOD del día */}
            <div>
                <h3 className="text-lg font-semibold mb-4">WOD del Día</h3>
                {wods.length > 0 ? (
                    <div className="space-y-4">
                        {wods.map((wod) => (
                            <Link key={wod.id} href={`/wods/${wod.id}`}>
                                <Card className="border-zinc-800 bg-zinc-900/50 hover:border-amber-500/30 transition-colors cursor-pointer">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg text-white">{wod.title}</CardTitle>
                                            <Badge
                                                variant="outline"
                                                className="border-amber-500/30 text-amber-500"
                                            >
                                                {wod.wod_type.replace("_", " ")}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-zinc-400 text-sm whitespace-pre-wrap">
                                            {wod.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card className="border-zinc-800 bg-zinc-900/50 border-dashed">
                        <CardContent className="py-12 text-center">
                            <p className="text-zinc-500">No hay WODs programados para hoy.</p>
                            {profile?.role === "ADMIN" && (
                                <Link
                                    href="/admin/wods"
                                    className="mt-2 inline-block text-amber-500 hover:underline text-sm"
                                >
                                    Crear un WOD →
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
