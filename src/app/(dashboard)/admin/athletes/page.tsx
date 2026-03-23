import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/types/database";
import { AthleteForm } from "@/components/athlete-form";
import { DeleteAthleteButton } from "@/components/delete-athlete-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function AdminAthletesPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Verificar admin
    const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user!.id)
        .single();

    const profile = profileData as Pick<Profile, "role"> | null;
    if (profile?.role !== "ADMIN" && profile?.role !== "SUPERADMIN") redirect("/");

    // Obtener todos los atletas (no admins)
    const { data: athletesData } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "USER")
        .order("full_name");

    const athletes = (athletesData || []) as Profile[];

    // Stats
    const activeCount = athletes.filter((a) => a.is_active).length;
    const inactiveCount = athletes.length - activeCount;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Atletas</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Gestiona los atletas del box. <span className="font-medium text-indigo-600">{activeCount} activos</span>
                        {inactiveCount > 0 && (
                            <span className="text-red-400 ml-2">{inactiveCount} inactivos</span>
                        )}
                    </p>
                </div>
                <AthleteForm
                    trigger={
                        <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white">
                            + Nuevo Atleta
                        </Button>
                    }
                />
            </div>

            {athletes.length > 0 ? (
                <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Nombre</TableHead>
                                <TableHead>Peso</TableHead>
                                <TableHead>Altura</TableHead>
                                <TableHead>Último Pago</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {athletes.map((athlete) => (
                                <TableRow key={athlete.id}>
                                    <TableCell>
                                        <Link href={`/admin/athletes/${athlete.id}`} className="flex items-center gap-3 hover:bg-muted/50 p-1 -m-1 rounded-md transition-colors group">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/10 text-xs font-bold text-indigo-600">
                                                {athlete.full_name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .slice(0, 2)
                                                    .toUpperCase() || "?"}
                                            </div>
                                            <span className="font-medium group-hover:text-indigo-600 transition-colors">
                                                {athlete.full_name || "Sin nombre"}
                                            </span>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {athlete.weight_kg ? `${athlete.weight_kg} kg` : "—"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {athlete.height_cm ? `${athlete.height_cm} cm` : "—"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {athlete.last_payment_date ?? "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={
                                                athlete.is_active
                                                    ? "border-green-500/30 text-green-400"
                                                    : "border-red-500/30 text-red-400"
                                            }
                                        >
                                            {athlete.is_active ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <AthleteForm
                                                athlete={athlete}
                                                trigger={
                                                    <Button variant="ghost" size="sm">
                                                        Editar
                                                    </Button>
                                                }
                                            />
                                            <DeleteAthleteButton
                                                athleteId={athlete.id}
                                                athleteName={athlete.full_name}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="rounded-xl border border-border border-dashed py-16 flex flex-col items-center justify-center text-center bg-muted/5">
                    <div className="bg-muted p-4 rounded-full mb-4">
                        <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-lg">No hay atletas registrados</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Comienza agregando atletas para gestionar sus pagos y progreso.
                    </p>
                </div>
            )}
        </div>
    );
}
