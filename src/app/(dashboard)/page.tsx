/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Activity,
    CalendarPlus,
    CreditCard,
    Dumbbell,
    Trophy,
    Users,
    ChevronRight,
    Play
} from "lucide-react";

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
    const isAdmin = ["ADMIN", "SUPERADMIN"].includes(profile?.role || "");
    const firstName = profile?.full_name?.split(" ")[0] || "Atleta";

    // Saludo dinámico según hora del día
    const hour = new Date().getUTCHours() - 4; // Hora Venezuela (UTC-4)
    const greeting =
        hour >= 5 && hour < 12 ? "Buenos días" :
        hour >= 12 && hour < 18 ? "Buenas tardes" :
        "Buenas noches";

    // Badge de estado de pago dinámico
    const lastPay = profile?.last_payment_date ? new Date(profile.last_payment_date) : null;
    const today = new Date();
    const payDiffDays = lastPay ? Math.ceil((today.getTime() - lastPay.getTime()) / (1000 * 60 * 60 * 24)) : null;
    const payBadge =
        payDiffDays === null ? { label: "Activo", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", dot: "bg-green-500" } :
        payDiffDays > 3   ? { label: "En mora", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", dot: "bg-red-500" } :
        payDiffDays > 0   ? { label: "Vence pronto", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", dot: "bg-yellow-500" } :
        { label: "Al día", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", dot: "bg-green-500" };

    // WOD Feed (Instagram Style)
    const todayStr = new Date().toISOString().split("T")[0];
    const { data: feedWodsData } = await supabase
        .from("wods")
        .select(`
            *,
            coach:profiles!wods_created_by_fkey(full_name),
            wod_sections(id, section_type)
        `)
        .order("date", { ascending: false })
        .limit(10);

    const wods = (feedWodsData || []) as any[];

    // Resultados del Atleta para inyectar puntaje en cards
    const { data: userResults } = await supabase
        .from("wod_results")
        .select("section_id, score_value, score_type")
        .eq("user_id", user!.id);
    
    const userResultsMap = new Map();
    (userResults || []).forEach(r => userResultsMap.set(r.section_id, r));

    // Stats rápidas comunes
    const { count: totalWods } = await supabase
        .from("wod_results")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);

    const { count: totalPrs } = await supabase
        .from("personal_records")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);

    // ==========================================
    // RENDER: VISTA ADMIN (ENTRENADOR)
    // ==========================================
    if (isAdmin) {
        // Datos extra para Admin (ej: total usuarios activos)
        const { count: totalAthletes } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "USER")
            .eq("is_active", true);

        return (
            <div className="space-y-8 pb-8">
                {/* Header Admin */}
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Panel de Control
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Hola, {firstName}. Aquí tienes el resumen de Iron Fit.
                    </p>
                </div>

                {/* Acciones Rápidas (Grid principal) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/admin/wods">
                        <Card className="hover:border-indigo-600/50 hover:bg-indigo-600/5 transition-all cursor-pointer h-full border-indigo-600/20 bg-indigo-600/5">
                            <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-2">
                                <div className="p-3 bg-indigo-600/10 rounded-full text-indigo-600">
                                    <CalendarPlus className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Crear WOD</p>
                                    <p className="text-[10px] text-muted-foreground">Programar rutina</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/admin/athletes">
                        <Card className="hover:border-indigo-600/50 hover:bg-muted/30 transition-all cursor-pointer h-full">
                            <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-2">
                                <div className="p-3 bg-muted rounded-full text-foreground hover:text-indigo-600 transition-colors">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Atletas</p>
                                    <p className="text-[10px] text-muted-foreground">{totalAthletes} activos</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/admin/payments">
                        <Card className="hover:border-indigo-600/50 hover:bg-muted/30 transition-all cursor-pointer h-full">
                            <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-2">
                                <div className="p-3 bg-muted rounded-full text-foreground hover:text-indigo-600 transition-colors">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Pagos</p>
                                    <p className="text-[10px] text-muted-foreground">Gestionar mes</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/admin/movements">
                        <Card className="hover:border-indigo-600/50 hover:bg-muted/30 transition-all cursor-pointer h-full">
                            <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-2">
                                <div className="p-3 bg-muted rounded-full text-foreground hover:text-indigo-600 transition-colors">
                                    <Dumbbell className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Movimientos</p>
                                    <p className="text-[10px] text-muted-foreground">Catálogo RM</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Resumen del Día Admin */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Activity className="w-5 h-5 text-indigo-600" /> WODs de Hoy
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {wods.length > 0 ? (
                                <div className="space-y-3">
                                    {wods.map((wod) => (
                                        <div key={wod.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                            <div>
                                                <p className="font-semibold text-sm">{wod.title}</p>
                                                <div className="flex gap-1 mt-1">
                                                    {wod.wod_sections?.map((sec: any, i: number) => (
                                                        <Badge key={i} variant="secondary" className="text-[9px] px-1 h-4">
                                                            {sec.section_type}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <Link href={`/wods/${wod.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                                    No hay rutinas para hoy.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Acceso Rápido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/profile" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                <Trophy className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium text-sm">Mis RMs (Entrenador)</p>
                                    <p className="text-xs text-muted-foreground">Registros personales</p>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // ==========================================
    // RENDER: VISTA ATLETA (USER)
    // ==========================================
    return (
        <div className="space-y-6 pb-20">
            {/* Intro Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {greeting}, <span className="text-indigo-600">{firstName}</span> 👋
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Tu progreso de hoy en Iron Fit.
                    </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${payBadge.bg} ${payBadge.border}`}>
                    <div className={`w-2 h-2 rounded-full ${payBadge.dot}`} />
                    <span className={`text-[10px] font-semibold ${payBadge.color}`}>{payBadge.label}</span>
                </div>
            </div>
            {/* Banner de aviso de pago (solo si vence pronto: 1-3 días) */}
            {payDiffDays !== null && payDiffDays > 0 && payDiffDays <= 3 && (
                <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
                    <span className="text-lg mt-0.5">⚠️</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-yellow-600">Tu mensualidad vence pronto</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Tienes {payDiffDays} {payDiffDays === 1 ? "día" : "días"} de mora. Contáctate con tu entrenador para evitar la suspensión.
                        </p>
                    </div>
                </div>
            )}

            <div>
                <div className="flex items-center justify-between mb-3 mt-4">
                    <h3 className="text-lg font-bold">Últimos Entrenamientos</h3>
                </div>

                {wods.length > 0 ? (
                    <div className="space-y-4">
                        {wods.map((wod) => {
                            // Match user results with WOD sections to detect completion & scores
                            const wodScores = wod.wod_sections?.map((s: any) => userResultsMap.get(s.id)).filter(Boolean);
                            const isCompleted = wodScores && wod.wod_sections && wodScores.length === wod.wod_sections.length && wod.wod_sections.length > 0;

                            const wodDate = new Date(wod.date);
                            const formatter = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" });
                            const displayDate = formatter.format(new Date(wodDate.getTime() + wodDate.getTimezoneOffset() * 60000));

                            return (
                                <Card key={wod.id} className="overflow-hidden border-border/50 shadow-sm bg-card hover:border-indigo-600/30 transition-colors">
                                    <CardHeader className="pb-2 pt-4 border-b bg-muted/5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-base font-bold">{wod.title}</CardTitle>
                                                <p className="text-xs text-muted-foreground mt-1 capitalize">
                                                    {displayDate}
                                                </p>
                                            </div>
                                            <Badge className={wod.date === todayStr ? "bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/20 border-0 uppercase font-bold" : "bg-muted text-muted-foreground hover:bg-muted/80 border-0 uppercase font-bold"}>
                                                {wod.date === todayStr ? "Hoy" : "Completado"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground font-medium">
                                            <span className="flex items-center gap-1.5 bg-background border px-2 py-1 rounded-md">
                                                <Users className="w-3.5 h-3.5 text-indigo-600" />
                                                Coach: {wod.coach?.full_name?.split(" ")[0] || "Staff"}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-background border px-2 py-1 rounded-md">
                                                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                                                {wod.wod_sections?.length || 0} bloques
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 pb-4">
                                        {wodScores && wodScores.length > 0 && (
                                            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                                                <p className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1.5">
                                                    <Trophy className="w-3.5 h-3.5" /> Tus Resultados:
                                                </p>
                                                <div className="flex flex-col gap-1.5">
                                                    {wodScores.map((score: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center text-xs">
                                                            <span className="text-muted-foreground/80 font-medium">Bloque {idx + 1}</span>
                                                            <span className="font-bold text-foreground">
                                                                {score.score_value} {score.score_type === 'TIME' ? 'min' : ''}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <Link href={`/tracker/${wod.id}`}>
                                            <Button variant={isCompleted ? "outline" : "default"} className={`w-full h-11 shadow-sm font-semibold rounded-xl ${isCompleted ? "border-indigo-600/20 text-indigo-600" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                                                {isCompleted ? "Ver detalles de rutina" : "Empezar rutina"}
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="border-dashed bg-muted/5 shadow-none">
                        <CardContent className="py-10 flex flex-col items-center justify-center text-center">
                            <div className="p-3 bg-muted rounded-full mb-3">
                                <CalendarPlus className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h4 className="font-bold text-sm">Descanso</h4>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                                No hay entrenamientos recientes para mostrar.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
