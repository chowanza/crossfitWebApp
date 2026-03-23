import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Profile } from "@/lib/types/database";
import { Badge } from "@/components/ui/badge";
import { Contact } from "lucide-react";
import { CoachForm } from "@/components/coach-form";
import { Button } from "@/components/ui/button";
import { DeleteCoachButton } from "@/components/delete-coach-button";

export default async function AdminCoachesPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const profile = profileData as Pick<Profile, "role"> | null;
    
    // Sólo el SUPERADMIN puede gestionar entrenadores
    if (profile?.role !== "SUPERADMIN") redirect("/");

    // Obtener todos los coaches incluyendo SUPERADMINS
    const { data: coachesData } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["ADMIN", "SUPERADMIN"])
        .order("created_at", { ascending: false });

    const coaches = (coachesData || []) as Profile[];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Gestión de Entrenadores</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Añade, edita o retira accesos al cuerpo técnico del box. {coaches.length} activos.
                    </p>
                </div>
                <div className="flex gap-2">
                    <CoachForm
                        trigger={
                            <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-sm">
                                + Nuevo Entrenador
                            </Button>
                        }
                    />
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium border-b border-border">
                            <tr>
                                <th className="px-4 py-3 sm:px-6 sm:py-4">Nombre</th>
                                <th className="px-4 py-3 sm:px-6 sm:py-4 hidden md:table-cell">Métricas</th>
                                <th className="px-4 py-3 sm:px-6 sm:py-4 hidden lg:table-cell">Horario</th>
                                <th className="px-4 py-3 sm:px-6 sm:py-4 hidden sm:table-cell">Estado</th>
                                <th className="px-4 py-3 sm:px-6 sm:py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {coaches.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No se encontraron entrenadores.
                                    </td>
                                </tr>
                            ) : (
                                coaches.map((coach) => (
                                    <tr key={coach.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 sm:px-6 sm:py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full overflow-hidden border border-muted bg-indigo-600/10 flex items-center justify-center shrink-0 text-indigo-600 font-bold text-xs uppercase">
                                                    {coach.avatar_url ? (
                                                        <img src={coach.avatar_url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        coach.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"
                                                    )}
                                                </div>
                                                <Link href={`/admin/athletes/${coach.id}`} className="font-semibold hover:text-indigo-500 hover:underline transition-colors cursor-pointer">
                                                    {coach.full_name || "Sin nombre"}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 sm:px-6 sm:py-4 hidden md:table-cell text-xs text-muted-foreground">
                                            {coach.height_cm ? `${coach.height_cm} cm` : "-"} / {coach.weight_kg ? `${coach.weight_kg} kg` : "-"}
                                        </td>
                                        <td className="px-4 py-3 sm:px-6 sm:py-4 hidden lg:table-cell text-xs">
                                            {coach.coach_schedule ? (
                                                <span className="line-clamp-2 max-w-[200px]" title={coach.coach_schedule}>
                                                    {coach.coach_schedule}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground italic">No asignado</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 sm:px-6 sm:py-4 hidden sm:table-cell">
                                            {coach.is_active ? (
                                                <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/10">Activo</Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/10">Inactivo</Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 sm:px-6 sm:py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <CoachForm
                                                    coach={coach}
                                                    trigger={
                                                        <button className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline">
                                                            Editar
                                                        </button>
                                                    }
                                                />
                                                {coach.role !== "SUPERADMIN" && coach.id !== user?.id && (
                                                    <DeleteCoachButton id={coach.id} name={coach.full_name || "Sin nombre"} />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
