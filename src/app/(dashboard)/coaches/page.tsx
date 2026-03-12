import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";
import { Users } from "lucide-react";

export default async function CoachesPage() {
    const supabase = await createClient();

    // Fetch all admins (coaches)
    const { data: coachesData } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "ADMIN")
        .order("full_name");

    const coaches = (coachesData || []) as Profile[];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Nuestros Entrenadores</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Conoce a los entrenadores de Iron Fit Venezuela.
                    </p>
                </div>
            </div>

            {coaches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coaches.map((coach) => (
                        <div key={coach.id} className="relative group overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="p-6 flex flex-col items-center text-center space-y-4">
                                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-muted flex shrink-0 items-center justify-center bg-blue-500/10 text-3xl font-bold text-blue-500">
                                    {coach.avatar_url ? (
                                        <img src={coach.avatar_url} alt={coach.full_name || "Coach"} className="h-full w-full object-cover" />
                                    ) : (
                                        coach.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "IF"
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{coach.full_name || "Entrenador Asignado"}</h3>
                                    <p className="text-sm font-medium text-blue-500 uppercase tracking-widest mt-1">Head Coach</p>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    {coach.weight_kg && <p>Peso: {coach.weight_kg} kg</p>}
                                    {coach.height_cm && <p>Estatura: {coach.height_cm} cm</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-border border-dashed py-16 flex flex-col items-center justify-center text-center bg-muted/5">
                    <div className="bg-muted p-4 rounded-full mb-4">
                        <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-lg">Aún no hay entrenadores registrados</p>
                </div>
            )}
        </div>
    );
}
