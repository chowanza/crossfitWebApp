/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, ChevronRight, Dumbbell, Settings } from "lucide-react";
import { SearchInput } from "@/components/search-input";
import { DateInput } from "@/components/date-input";

export default async function WodsPage(props: { searchParams?: Promise<{ query?: string; date?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || "";
    const dateQuery = searchParams?.date || "";

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userRole = "USER";
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
        if (profile) userRole = profile.role;
    }

    // Fetch wods con sections
    let queryBuilder = supabase
        .from("wods")
        .select(`
            *,
            wod_sections(section_type)
        `)
        .order("date", { ascending: false });

    if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,notes.ilike.%${query}%`);
    }
    if (dateQuery) {
        queryBuilder = queryBuilder.eq("date", dateQuery);
    } else if (!query) {
        // Solo limitar si no hay filtros aplicados
        queryBuilder = queryBuilder.limit(30);
    }

    const { data: wodsData } = await queryBuilder;

    const wods = (wodsData || []) as any[];

    // Agrupar por fecha
    const grouped = wods.reduce<Record<string, any[]>>((acc, wod) => {
        if (!acc[wod.date]) acc[wod.date] = [];
        acc[wod.date].push(wod);
        return acc;
    }, {});

    const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="space-y-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Registro de Entrenamientos</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Selecciona una fecha para ver los bloques y registrar tu marca.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="w-full sm:w-64 shrink-0">
                        <SearchInput placeholder="Buscar por título..." />
                    </div>
                    <div className="w-full sm:w-48 shrink-0">
                        <DateInput />
                    </div>
                    {["ADMIN", "SUPERADMIN"].includes(userRole) && (
                        <Link href="/admin/wods" className="w-full sm:w-auto mt-2 sm:mt-0">
                            <Button variant="outline" className="w-full shrink-0 gap-2 border-indigo-600/30 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100">
                                <Settings className="w-4 h-4" />
                                <span className="sm:hidden lg:inline">Gestionar WODs</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {dates.length > 0 ? (
                <div className="space-y-6">
                    {dates.map((date) => (
                        <div key={date}>
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                    {date === today ? "Hoy" : date}
                                </h3>
                                {date === today && (
                                    <Badge className="ml-2 bg-indigo-600/20 text-indigo-600 border-0 text-[10px] px-2 uppercase tracking-wide">
                                        Entrenamiento
                                    </Badge>
                                )}
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {grouped[date].map((wod) => (
                                    <Link key={wod.id} href={`/wods/${wod.id}`}>
                                        <Card className="group hover:border-indigo-600/50 transition-all shadow-sm hover:shadow h-full flex flex-col justify-between">
                                            <CardHeader className="pb-2 pt-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <CardTitle className="text-base leading-tight group-hover:text-indigo-600 transition-colors">
                                                        {wod.title}
                                                    </CardTitle>
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pb-4">
                                                <p className="text-muted-foreground text-xs line-clamp-2 mb-3">
                                                    {wod.notes || "Preparado por tu coach. Toca para ver detalle."}
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {wod.wod_sections?.map((sec: any, i: number) => (
                                                        <Badge
                                                            key={i}
                                                            variant="secondary"
                                                            className="text-[9px] px-1.5 font-medium bg-muted/80 text-muted-foreground group-hover:bg-indigo-600/10 group-hover:text-indigo-600 transition-colors"
                                                        >
                                                            {sec.section_type}
                                                        </Badge>
                                                    ))}
                                                    {(!wod.wod_sections || wod.wod_sections.length === 0) && (
                                                        <span className="text-[10px] text-muted-foreground italic">Sin bloques</span>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed bg-muted/5 py-16 flex flex-col items-center justify-center text-center">
                    <div className="bg-muted p-4 rounded-full mb-4">
                        <Dumbbell className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg">No hay WODs publicados</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-1">
                        Tu entrenador aún no ha programado rutinas. Vuelve más tarde.
                    </p>
                </div>
            )}
        </div>
    );
}
