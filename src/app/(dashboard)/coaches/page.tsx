import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";
import { Users, Edit2 } from "lucide-react";
import Link from "next/link";
import { CoachForm } from "@/components/coach-form";
import { SearchInput } from "@/components/search-input";

export default async function CoachesPage(props: { searchParams?: Promise<{ query?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || "";
    const supabase = await createClient();

    // Fetch all admins (coaches)
    let queryBuilder = supabase
        .from("profiles")
        .select("*")
        .eq("role", "ADMIN")
        .order("full_name");
        
    if (query) {
        queryBuilder = queryBuilder.ilike("full_name", `%${query}%`);
    }

    const { data: coachesData } = await queryBuilder;
    const coaches = (coachesData || []) as Profile[];

    const { data: { user } } = await supabase.auth.getUser();
    let isSuperAdmin = false;
    
    if (user) {
        const { data: currentProfile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
        
        isSuperAdmin = currentProfile?.role === "SUPERADMIN";
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Nuestros Entrenadores</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Conoce a los entrenadores de Iron Fit Venezuela.
                    </p>
                </div>
                <div className="w-full sm:w-72">
                    <SearchInput placeholder="Buscar por nombre..." />
                </div>
            </div>

            {coaches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coaches.map((coach) => (
                        <div key={coach.id} className="relative group overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
                            <Link href={`/coaches/${coach.id}`} className="block">
                                <div className="p-6 flex flex-col items-center text-center space-y-4">
                                    <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-muted flex shrink-0 items-center justify-center bg-indigo-600/10 text-3xl font-bold text-indigo-600">
                                        {coach.avatar_url ? (
                                            <img src={coach.avatar_url} alt={coach.full_name || "Coach"} className="h-full w-full object-cover" />
                                        ) : (
                                            coach.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "IF"
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold group-hover:text-indigo-600 transition-colors">{coach.full_name || "Entrenador Asignado"}</h3>
                                        <p className="text-sm font-medium text-indigo-600 uppercase tracking-widest mt-1">Coach</p>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-0.5">
                                        {coach.weight_kg && <p>Peso: {coach.weight_kg} kg</p>}
                                        {coach.height_cm && <p>Estatura: {coach.height_cm} cm</p>}
                                        {coach.coach_schedule && <p className="pt-2 text-indigo-500 font-medium whitespace-pre-wrap">{coach.coach_schedule}</p>}
                                    </div>
                                </div>
                            </Link>

                            {isSuperAdmin && (
                                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CoachForm
                                        coach={coach}
                                        trigger={
                                            <button className="p-2 rounded-full bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm border border-indigo-100 cursor-pointer">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        }
                                    />
                                </div>
                            )}
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
