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
                        <Card className="hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer h-full border-blue-500/20 bg-blue-500/5">
                            <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-2">
                                <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
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
                        <Card className="hover:border-blue-500/50 hover:bg-muted/30 transition-all cursor-pointer h-full">
                            <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-2">
                                <div className="p-3 bg-muted rounded-full text-foreground hover:text-blue-500 transition-colors">
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
                        <Card className="hover:border-blue-500/50 hover:bg-muted/30 transition-all cursor-pointer h-full">
                            <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-2">
                                <div className="p-3 bg-muted rounded-full text-foreground hover:text-blue-500 transition-colors">
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
                        <Card className="hover:border-blue-500/50 hover:bg-muted/30 transition-all cursor-pointer h-full">
                            <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-2">
                                <div className="p-3 bg-muted rounded-full text-foreground hover:text-blue-500 transition-colors">
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
                                <Activity className="w-5 h-5 text-blue-500" /> WODs de Hoy
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
        <div className="space-y-8 pb-8">
            {/* Header Atleta */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        ¿Listo para hoy, <span className="text-blue-500">{firstName}</span>?
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Tu centro de entrenamiento personal.
                    </p>
                </div>

                {/* Pago Status Badge */}
                <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-full border border-border/50 w-fit">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium">Suscripción Activa</span>
                </div>
            </div>

            {/* Main Action: WOD del día */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" /> Entrenamiento de Hoy
                    </h3>
                    <Link href="/wods" className="text-xs text-blue-500 font-medium hover:underline">
                        Ver anteriores
                    </Link>
                </div>

                {wods.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {wods.map((wod) => (
                            <Card key={wod.id} className="relative overflow-hidden border-border/60 hover:border-blue-500/50 transition-all shadow-sm">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Dumbbell className="w-24 h-24 -mr-6 -mt-6 transform rotate-12" />
                                </div>
                                <CardHeader className="pb-3 relative z-10">
                                    <div className="flex gap-1.5 flex-wrap mb-2">
                                        {wod.wod_sections?.map((sec: any, i: number) => (
                                            <Badge key={i} variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-[10px] px-2 h-5 font-semibold">
                                                {sec.section_type}
                                            </Badge>
                                        ))}
                                    </div>
                                    <CardTitle className="text-xl">{wod.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 mt-2 font-medium">
                                        {wod.notes || "Preparado por tu coach. Toca para ver detalle."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="relative z-10 pt-4 pb-5">
                                    <Link href={`/wods/${wod.id}`} className="w-full block">
                                        <Button className="w-full shadow-md bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400">
                                            <Play className="w-4 h-4 mr-2 fill-current" /> Ver e Iniciar
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed bg-muted/10">
                        <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="p-4 bg-muted rounded-full">
                                <CalendarPlus className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-semibold">Día de Descanso Activo</p>
                                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                    Tu coach no ha publicado la rutina de hoy. Aprovecha para estirar o salir a correr.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Quick Stats Atleta */}
            <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-blue-500" /> Tus Marcas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground font-medium">Bloques Ejecutados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-foreground">{totalWods ?? 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card cursor-pointer hover:border-blue-500/30 transition-colors">
                        <Link href="/prs" className="block w-full h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-muted-foreground font-medium flex justify-between items-center">
                                    PRs (RMs)
                                    <ChevronRight className="w-4 h-4" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-blue-500">{totalPrs ?? 0}</div>
                            </CardContent>
                        </Link>
                    </Card>
                </div>
            </div>
        </div>
    );
}
