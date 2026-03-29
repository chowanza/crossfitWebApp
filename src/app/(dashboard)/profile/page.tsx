import { createClient } from "@/lib/supabase/server";
import type { Profile, PersonalRecord, Movement } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PrProgressChart } from "@/components/charts/pr-progress-chart";
import { ProfileEditDialog } from "@/components/profile-edit-dialog";
import { Activity, Trophy, Users, CalendarPlus, Phone, CreditCard, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

    // Historial de WODs Completados (estilo Instagram)
    const { data: userResults } = await supabase
        .from("wod_results")
        .select("section_id, score_value, score_type, wod_sections!inner(wod_id)")
        .eq("user_id", user!.id);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wodIds = Array.from(new Set((userResults || []).map((r: any) => r.wod_sections?.wod_id).filter(Boolean)));
    const userResultsMap = new Map();
    (userResults || []).forEach((r) => userResultsMap.set(r.section_id, r));

    // Fetch the specific completed WODs
    const { data: completedWodsData } = await supabase
        .from("wods")
        .select(`
            *,
            coach:profiles!wods_created_by_fkey(full_name),
            wod_sections(
                id,
                section_type,
                description,
                time_cap_seconds,
                wod_section_movements(
                    id,
                    reps,
                    weight_kg,
                    movements(name)
                )
            )
        `)
        .in("id", wodIds.length > 0 ? wodIds : ["00000000-0000-0000-0000-000000000000"])
        .order("date", { ascending: false });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completedWods = (completedWodsData || []) as any[];

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {profile.avatar_url ? (
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-indigo-600/20 cursor-pointer hover:border-indigo-600/50 transition-colors shadow-sm">
                                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-sm p-0 border-0 bg-transparent shadow-none">
                                <DialogHeader className="sr-only">
                                    <DialogTitle>Foto de {profile.full_name}</DialogTitle>
                                </DialogHeader>
                                <div className="rounded-2xl overflow-hidden shadow-2xl bg-black/50 backdrop-blur-sm">
                                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-auto object-contain" />
                                </div>
                            </DialogContent>
                        </Dialog>
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
                                profile.role === "SUPERADMIN"
                                    ? "border-amber-500/50 text-amber-600 bg-amber-50/50 font-bold"
                                    : profile.role === "ADMIN"
                                        ? "border-indigo-600/30 text-indigo-600"
                                        : "border-muted-foreground/30 text-muted-foreground"
                            }
                        >
                            {profile.role === "SUPERADMIN" ? "Superadmin" : profile.role === "ADMIN" ? "Entrenador" : "Atleta"}
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
                        <Badge variant="outline" className={profile.is_active ? "border-green-500/30 text-green-500" : "border-red-500/30 text-red-400"}>
                            {profile.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">Cuenta</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tarjeta de Identidad */}
            <Card className="border-border bg-muted/10">
                <CardContent className="pt-5 pb-5">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                                <IdCard className="w-3 h-3" /> Cédula
                            </p>
                            <p className="font-mono text-sm font-medium">
                                {profile.cedula || <span className="text-muted-foreground/40 italic">—</span>}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Phone className="w-3 h-3" /> Teléfono
                            </p>
                            <p className="text-sm font-medium">
                                {profile.phone || <span className="text-muted-foreground/40 italic">—</span>}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Nacimiento</p>
                            <p className="text-sm font-medium">
                                {profile.birth_date
                                    ? new Date(profile.birth_date + "T00:00:00").toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" })
                                    : <span className="text-muted-foreground/40 italic">—</span>}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                                <CreditCard className="w-3 h-3" /> Pago Siguiente
                            </p>
                            <p className="text-sm font-medium">
                                {profile.last_payment_date || <span className="text-muted-foreground/40 italic">Sin registro</span>}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* WOD Feed (Instagram Style) */}
            <div>
                <div className="flex items-center justify-between mb-3 mt-4">
                    <h3 className="text-lg font-bold text-foreground/90">Historial de Entrenamientos</h3>
                </div>

                {completedWods.length > 0 ? (
                    <div className="space-y-4">
                        {completedWods.map((wod) => {
                            const wodDate = new Date(wod.date);
                            const formatter = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" });
                            const displayDate = formatter.format(new Date(wodDate.getTime() + wodDate.getTimezoneOffset() * 60000));

                            return (
                                <Link href={`/wods/${wod.id}`} key={wod.id} className="block group">
                                    <Card className="overflow-hidden border-border/50 shadow-sm bg-card group-hover:border-indigo-600/50 group-hover:shadow-md transition-all">
                                        <CardHeader className="pb-2 pt-4 border-b bg-muted/5 group-hover:bg-indigo-50/10 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-base font-bold">{wod.title}</CardTitle>
                                                <p className="text-xs text-muted-foreground mt-1 capitalize">
                                                    {displayDate}
                                                </p>
                                            </div>
                                            <Badge className="bg-muted text-muted-foreground border-0 uppercase font-bold">
                                                Completado
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground font-medium flex-wrap">
                                            <span className="flex items-center gap-1.5 bg-background border px-2 py-1 rounded-md shrink-0">
                                                <Users className="w-3.5 h-3.5 text-indigo-600" />
                                                Coach: {wod.coach?.full_name?.split(" ")[0] || "Staff"}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-background border px-2 py-1 rounded-md shrink-0">
                                                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                                                {wod.wod_sections?.length || 0} bloques
                                            </span>
                                            {wod.wod_sections?.map((sec: any, i: number) => (
                                                <Badge
                                                    key={i}
                                                    variant="secondary"
                                                    className="text-[9px] px-1.5 font-medium bg-muted text-muted-foreground uppercase"
                                                >
                                                    {sec.section_type}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 pb-4">
                                        {wod.notes && (
                                            <div className="mb-4">
                                                <p className="text-sm text-foreground/85 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                                                    {wod.notes}
                                                </p>
                                            </div>
                                        )}

                                        <div className="space-y-3 mb-4">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {wod.wod_sections?.map((sec: any, idx: number) => {
                                                const score = userResultsMap.get(sec.id);
                                                return (
                                                    <div key={sec.id} className="rounded-xl border border-border/50 bg-background/50 overflow-hidden shadow-sm">
                                                        <div className="bg-muted/30 px-3 py-2 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-green-600/10 text-green-700 font-bold border border-green-600/20 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                                                                    {sec.section_type}
                                                                </span>
                                                            </div>
                                                            {sec.time_cap_seconds && (
                                                                <div className="text-xs text-muted-foreground font-semibold flex gap-1.5">
                                                                    <span>{Math.floor(sec.time_cap_seconds / 60)}' TC</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {sec.wod_section_movements && sec.wod_section_movements.length > 0 && (
                                                            <div className="p-2 border-t border-border/30">
                                                                <ul className="space-y-1">
                                                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                                    {sec.wod_section_movements.map((mov: any) => (
                                                                        <li key={mov.id} className="text-xs flex justify-between items-center bg-muted/20 px-2 py-1.5 rounded-md text-foreground/80">
                                                                            <span className="font-medium">
                                                                                <span className="text-indigo-600 font-black mr-1.5">{mov.reps}x</span>
                                                                                {mov.movements?.name || "Ejercicio"}
                                                                            </span>
                                                                            {mov.weight_kg && (
                                                                                <span className="text-[10px] text-muted-foreground font-bold bg-background border px-1.5 py-0.5 rounded shadow-sm">
                                                                                    {mov.weight_kg}kg
                                                                                </span>
                                                                            )}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {score && (
                                                            <div className="bg-green-500/10 px-3 py-2 border-t border-green-500/20 flex justify-between items-center">
                                                                <span className="text-xs font-bold text-green-700 flex items-center gap-1.5">
                                                                    <Trophy className="w-4 h-4" /> Tu Resultado:
                                                                </span>
                                                                <span className="font-bold text-foreground text-sm">
                                                                    {score.score_value} {score.score_type === 'TIME' ? 'min' : ''}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <Button variant="outline" className="w-full h-11 shadow-sm font-semibold rounded-xl border-indigo-600/20 text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                                            Ver detalles de rutina
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="border-dashed bg-muted/5 shadow-none pb-4">
                        <CardContent className="py-10 flex flex-col items-center justify-center text-center">
                            <div className="p-3 bg-muted rounded-full mb-3">
                                <CalendarPlus className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h4 className="font-bold text-sm">Sin Actividad</h4>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                                Completa WODs para ver tu actividad aquí.
                            </p>
                        </CardContent>
                    </Card>
                )}
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
                        <p className="text-sm text-muted-foreground">Pago siguiente</p>
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
