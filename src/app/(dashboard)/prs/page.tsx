import { createClient } from "@/lib/supabase/server";
import type { Movement, PersonalRecord } from "@/lib/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrForm } from "@/components/pr-form";
import { MovementMediaDialog } from "@/components/movement-media-dialog";
import { Dumbbell, PersonStanding, Timer, Zap } from "lucide-react";

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

    const categoryInfo: Record<string, { label: string, icon: React.ReactNode }> = {
        WEIGHTLIFTING: { label: "Halterofilia", icon: <Dumbbell className="w-4 h-4" /> },
        GYMNASTICS: { label: "Gimnásticos", icon: <PersonStanding className="w-4 h-4" /> },
        CARDIO: { label: "Cardio", icon: <Timer className="w-4 h-4" /> },
        OTHER: { label: "Otros", icon: <Zap className="w-4 h-4" /> },
    };

    const categories = ["WEIGHTLIFTING", "GYMNASTICS", "CARDIO", "OTHER"] as const;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Mis PRs</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Tus pesos máximos por movimiento.
                    </p>
                </div>
                <PrForm
                    movements={movements}
                    trigger={
                        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
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

                const { label, icon } = categoryInfo[category];

                return (
                    <div key={category}>
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            {icon} {label}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {categoryItems.map(({ movement, bestPr, historyCount }) => (
                                <Card
                                    key={movement.id}
                                    className="border-border bg-muted/10 hover:border-border/80 transition-colors"
                                >
                                    <CardContent className="pt-5 pb-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <h4 className="font-medium text-foreground text-sm flex items-center">
                                                {movement.name}
                                                {movement.media_url && (
                                                    <MovementMediaDialog
                                                        movementName={movement.name}
                                                        mediaUrl={movement.media_url}
                                                    />
                                                )}
                                            </h4>
                                            {bestPr && bestPr.reps === 1 && (
                                                <Badge className="bg-blue-500/20 text-blue-500 border-0 text-[10px]">
                                                    1RM
                                                </Badge>
                                            )}
                                        </div>
                                        {bestPr ? (
                                            <div>
                                                <p className="text-2xl font-bold text-blue-500">
                                                    {bestPr.weight_value}
                                                    <span className="text-sm text-muted-foreground ml-1">kg</span>
                                                </p>
                                                {bestPr.reps > 1 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        × {bestPr.reps} reps
                                                    </p>
                                                )}
                                                {historyCount > 1 && (
                                                    <p className="text-xs text-muted-foreground/70 mt-1">
                                                        {historyCount} registros
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-sm text-muted-foreground/70">Sin registro</p>
                                                <PrForm
                                                    movements={movements}
                                                    defaultMovementId={movement.id}
                                                    trigger={
                                                        <button className="text-xs text-blue-500 hover:underline mt-1">
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
