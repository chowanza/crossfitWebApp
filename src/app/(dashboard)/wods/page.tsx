import { createClient } from "@/lib/supabase/server";
import type { Wod } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function WodsPage() {
    const supabase = await createClient();

    const { data: wodsData } = await supabase
        .from("wods")
        .select("*")
        .order("date", { ascending: false })
        .limit(30);

    const wods = (wodsData || []) as Wod[];

    // Agrupar por fecha
    const grouped = wods.reduce<Record<string, Wod[]>>((acc, wod) => {
        if (!acc[wod.date]) acc[wod.date] = [];
        acc[wod.date].push(wod);
        return acc;
    }, {});

    const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold">WODs</h2>
                <p className="text-zinc-400 text-sm mt-1">
                    Rutinas recientes. Toca una para ver detalles y registrar tu score.
                </p>
            </div>

            {dates.length > 0 ? (
                dates.map((date) => (
                    <div key={date}>
                        <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                                {date === today ? "Hoy" : date}
                            </h3>
                            {date === today && (
                                <Badge className="bg-amber-500/20 text-amber-500 border-0 text-xs">
                                    Hoy
                                </Badge>
                            )}
                        </div>
                        <div className="space-y-3">
                            {grouped[date].map((wod) => (
                                <Link key={wod.id} href={`/wods/${wod.id}`}>
                                    <Card className="border-zinc-800 bg-zinc-900/50 hover:border-amber-500/30 transition-all cursor-pointer mb-3">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base text-white">
                                                    {wod.title}
                                                </CardTitle>
                                                <Badge
                                                    variant="outline"
                                                    className="border-zinc-700 text-zinc-400 text-xs"
                                                >
                                                    {wod.wod_type.replace("_", " ")}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-zinc-500 text-sm line-clamp-2">
                                                {wod.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="rounded-lg border border-zinc-800 border-dashed py-12 text-center">
                    <p className="text-zinc-500">No hay WODs aún.</p>
                </div>
            )}
        </div>
    );
}
