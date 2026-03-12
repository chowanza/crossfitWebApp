import type { SectionType, PersonalRecord, Movement } from "@/lib/types/database";
import { getWeightRecommendation } from "@/lib/recommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeightRecommendationProps {
    sectionType: SectionType;
    userPrs: (PersonalRecord & { movements: Pick<Movement, "name"> | null })[];
}

export function WeightRecommendation({
    sectionType,
    userPrs,
}: WeightRecommendationProps) {
    if (userPrs.length === 0) return null;

    // Buscar el mejor PR (1RM) por movimiento
    const bestByMovement: Record<
        string,
        { name: string; weight: number }
    > = {};

    userPrs.forEach((pr) => {
        const name = pr.movements?.name || "Desconocido";
        const key = pr.movement_id;
        if (!bestByMovement[key] || pr.weight_value > bestByMovement[key].weight) {
            bestByMovement[key] = { name, weight: pr.weight_value };
        }
    });

    const entries = Object.values(bestByMovement).slice(0, 6);

    return (
        <Card className="bg-muted/10 border-indigo-600/20">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-indigo-600 flex items-center gap-2">
                    <span>💡</span> Pesos Sugeridos ({sectionType.replace("_", " ")})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {entries.map((entry) => {
                        const rec = getWeightRecommendation(entry.weight, sectionType);
                        return (
                            <div
                                key={entry.name}
                                className="rounded-lg bg-background border p-3 text-center shadow-sm"
                            >
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate mb-1">{entry.name}</p>
                                <p className="text-xl font-black text-foreground">
                                    {rec.suggestedWeight}
                                    <span className="text-xs text-muted-foreground ml-0.5 font-medium">kg</span>
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    {rec.percentage}% de {entry.weight}kg
                                </p>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
