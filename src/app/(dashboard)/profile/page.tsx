import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
        return <p className="text-zinc-500">No se pudo cargar el perfil.</p>;
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

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-xl font-black text-white">
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
                                ? "border-amber-500/30 text-amber-500"
                                : "border-zinc-600 text-zinc-400"
                        }
                    >
                        {profile.role === "ADMIN" ? "Entrenador" : "Atleta"}
                    </Badge>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-zinc-800 bg-zinc-900/50 text-center">
                    <CardContent className="pt-6">
                        <p className="text-2xl font-bold text-amber-500">{totalWods ?? 0}</p>
                        <p className="text-xs text-zinc-500 mt-1">WODs</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/50 text-center">
                    <CardContent className="pt-6">
                        <p className="text-2xl font-bold text-amber-500">{totalPrs ?? 0}</p>
                        <p className="text-xs text-zinc-500 mt-1">PRs</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/50 text-center">
                    <CardContent className="pt-6">
                        <p className="text-2xl font-bold text-amber-500">
                            {profile.is_active ? "✓" : "✗"}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            {profile.is_active ? "Activo" : "Inactivo"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Info */}
            <Card className="border-zinc-800 bg-zinc-900/50">
                <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-zinc-500">Peso</p>
                            <p className="text-lg font-medium">
                                {profile.weight_kg ? `${profile.weight_kg} kg` : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Altura</p>
                            <p className="text-lg font-medium">
                                {profile.height_cm ? `${profile.height_cm} cm` : "—"}
                            </p>
                        </div>
                    </div>
                    <Separator className="bg-zinc-800" />
                    <div>
                        <p className="text-sm text-zinc-500">Último pago</p>
                        <p className="text-lg font-medium">
                            {profile.last_payment_date ?? "Sin registro"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500">Miembro desde</p>
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
