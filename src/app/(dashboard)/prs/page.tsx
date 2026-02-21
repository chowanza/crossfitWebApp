import { createClient } from "@/lib/supabase/server";
import type { Movement, PersonalRecord } from "@/lib/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrForm } from "@/components/pr-form";

interface PrWithMovement extends PersonalRecord {
    movements: Pick<Movement, "name" | "category"> | null;
}

export default async function PrsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Todos los movimientos
    const { data: movementsData } = await supabase
        .from("movements")
        .select("*")
        .order("category")
        .order("name");

    const movements = (movementsData || []) as Movement[];

    // PRs del usuario
    const { data: prsData } = await supabase
        .from("personal_records")
        .select("*, movements(name, category)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

    const prs = (prsData || []) as PrWithMovement[];

    // Agrupar PRs por movimiento (tomar el más pesado)
    const bestPrs = movements.map((movement) => {
        const movementPrs = prs.filter((pr) => pr.movement_id === movement.id);
        const bestPr = movementPrs.length > 0
            ? movementPrs.reduce((best, curr) =>
                curr.weight_value > best.weight_value ? curr : best
            )
            : null;
        return { movement, bestPr, historyCount: movementPrs.length };
    });

    const categoryLabels: Record<string, string> = {
        WEIGHTLIFTING: "🏋️ Halterofilia",
        GYMNASTICS: "🤸 Gimnásticos",
        CARDIO: "🏃 Cardio",
        OTHER: "⚡ Otros",
    };

    const categories = ["WEIGHTLIFTING", "GYMNASTICS", "CARDIO", "OTHER"] as const;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Mis PRs</h2>
                    <p className="text-zinc-400 text-sm mt-1">
                        Tus pesos máximos por movimiento.
                    </p>
                </div>
                <PrForm
                    movements={movements}
                    trigger={
                        <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                            + Nuevo PR
                        </Button>
                    }
                />
            </div>

            {categories.map((category) => {
                const categoryItems = bestPrs.filter(
                    (item) => item.movement.category === category
                );
                if (categoryItems.length === 0) return null;

                return (
                    <div key={category}>
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                            {categoryLabels[category]}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {categoryItems.map(({ movement, bestPr, historyCount }) => (
                                <Card
                                    key={movement.id}
                                    className="border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors"
                                >
                                    <CardContent className="pt-5 pb-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <h4 className="font-medium text-white text-sm">
                                                {movement.name}
                                            </h4>
                                            {bestPr && bestPr.reps === 1 && (
                                                <Badge className="bg-amber-500/20 text-amber-500 border-0 text-[10px]">
                                                    1RM
                                                </Badge>
                                            )}
                                        </div>
                                        {bestPr ? (
                                            <div>
                                                <p className="text-2xl font-bold text-amber-500">
                                                    {bestPr.weight_value}
                                                    <span className="text-sm text-zinc-500 ml-1">kg</span>
                                                </p>
                                                {bestPr.reps > 1 && (
                                                    <p className="text-xs text-zinc-500">
                                                        × {bestPr.reps} reps
                                                    </p>
                                                )}
                                                {historyCount > 1 && (
                                                    <p className="text-xs text-zinc-600 mt-1">
                                                        {historyCount} registros
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-sm text-zinc-600">Sin registro</p>
                                                <PrForm
                                                    movements={movements}
                                                    defaultMovementId={movement.id}
                                                    trigger={
                                                        <button className="text-xs text-amber-500 hover:underline mt-1">
                                                            Registrar →
                                                        </button>
                                                    }
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
