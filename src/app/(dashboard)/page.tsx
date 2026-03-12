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
    const isAdmin = profile?.role === "ADMIN";
    const firstName = profile?.full_name?.split(" ")[0] || "Atleta";

    // WOD del día con sus secciones
    const today = new Date().toISOString().split("T")[0];
    const { data: todayWods } = await supabase
        .from("wods")
        .select(`
            *,
            wod_sections(section_type)
        `)
        .eq("date", today)
        .order("created_at", { ascending: false });

    const wods = (todayWods || []) as any[];

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

            {/* Offer Banner */}
            <Card className="bg-card border-border overflow-hidden relative shadow-sm">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl" />
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Oferta 50%</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                    <p className="text-sm text-muted-foreground">
                        ¡Aprovecha nuestros descuentos en planes semestrales!
                        <span className="font-mono text-[11px] block mt-1.5 text-foreground/80">
                            Termina en 2d 6hr 55m 6s
                        </span>
                    </p>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-indigo-600 shadow-md text-white border-0">
                        Ver más
                    </Button>
                </CardContent>
            </Card>

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

            {/* WOD de Hoy */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold">Mis rutinas ({wods.length})</h3>
                    <Link href="/wods" className="text-xs text-indigo-600 font-bold hover:underline">
                        Ver pasadas
                    </Link>
                </div>

                {wods.length > 0 ? (
                    <div className="space-y-3">
                        {wods.map((wod) => (
                            <Card key={wod.id} className="overflow-hidden border-border/50 hover:border-indigo-600/30 transition-colors shadow-none bg-card">
                                <CardHeader className="pb-2 pt-4 bg-muted/5">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-base font-bold">{wod.title}</CardTitle>
                                        <Badge className="text-[9px] bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/20 border-0 px-2 py-0 uppercase uppercase font-bold tracking-wider">
                                            Hoy
                                        </Badge>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">
                                        {wod.wod_sections?.map((s: any) => s.section_type).join(" • ") || "WOD"}
                                    </p>
                                </CardHeader>
                                <CardContent className="pt-3 pb-4">
                                    <Link href={`/tracker/${wod.id}`}>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11 shadow-sm font-semibold rounded-xl">
                                            Empezar rutina
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed bg-muted/5 shadow-none">
                        <CardContent className="py-10 flex flex-col items-center justify-center text-center">
                            <div className="p-3 bg-muted rounded-full mb-3">
                                <CalendarPlus className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h4 className="font-bold text-sm">Descanso</h4>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                                No hay WOD asignado hoy. Dedica tiempo a estirar.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Tips de Entrenamiento */}
            <div>
                <h3 className="text-lg font-bold mb-3">Tips de entrenamiento</h3>
                <Card className="border-l-4 border-l-blue-500 overflow-hidden shadow-sm bg-card">
                    <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-base font-bold">Mejora tu empuje en Hip Thrust</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4 pt-1">
                        <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
                            Aprende la técnica correcta para maximizar la activación de glúteos sin lastimar tu zona lumbar.
                        </p>
                        <Button variant="secondary" className="w-full bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/20 font-semibold rounded-xl">
                            Explorar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
