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

    // WOD Feed (Instagram Style)
    const today = new Date().toISOString().split("T")[0];
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
                        Hola, <span className="text-indigo-600">{firstName}</span> 👋
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        ¿Qué entrenamos hoy?
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[10px] font-semibold text-green-500">Activo</span>
                </div>
            </div>

            {/* Horizontal Categories */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4 md:mx-0 md:px-0">
                <div className="snap-start shrink-0 w-32 h-24 rounded-2xl bg-gradient-to-br from-indigo-600/10 to-background border flex flex-col justify-end p-3 relative overflow-hidden group cursor-pointer hover:border-indigo-600/50 transition-colors">
                    <Dumbbell className="absolute top-2 right-2 w-10 h-10 text-indigo-600/20 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm tracking-tight text-foreground/90">CrossFit<br />Diario</span>
                </div>
                <div className="snap-start shrink-0 w-32 h-24 rounded-2xl bg-muted/20 border flex flex-col justify-end p-3 relative overflow-hidden group cursor-pointer hover:border-border/80 transition-colors">
                    <Activity className="absolute top-2 right-2 w-10 h-10 text-muted-foreground/20 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm tracking-tight text-foreground/90">Open<br />Box</span>
                </div>
                <div className="snap-start shrink-0 w-32 h-24 rounded-2xl bg-muted/20 border flex flex-col justify-end p-3 relative overflow-hidden group cursor-pointer hover:border-border/80 transition-colors">
                    <Trophy className="absolute top-2 right-2 w-10 h-10 text-muted-foreground/20 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm tracking-tight text-foreground/90">Fuerza<br />Extra</span>
                </div>
            </div>

            {/* WOD Feed (Instagram Style) */}
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
                                            <Badge className={wod.date === today ? "bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/20 border-0 uppercase font-bold" : "bg-muted text-muted-foreground hover:bg-muted/80 border-0 uppercase font-bold"}>
                                                {wod.date === today ? "Hoy" : "Completado"}
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
