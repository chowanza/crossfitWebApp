import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/types/database";
import { AthleteForm } from "@/components/athlete-form";
import { DeleteAthleteButton } from "@/components/delete-athlete-button";
import { ActivateAthleteButton } from "@/components/activate-athlete-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus } from "lucide-react";
import Link from "next/link";
import { SearchInput } from "@/components/search-input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function AdminAthletesPage(props: { searchParams?: Promise<{ query?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || "";
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

    const isSuperAdmin = profile?.role === "SUPERADMIN";

    // Atletas inactivos pendientes de activacion (solo para SUPERADMIN)
    const { data: pendingAthletesData } = isSuperAdmin
        ? await supabase
            .from("profiles")
            .select("*")
            .eq("role", "USER")
            .eq("is_active", false)
            .order("created_at", { ascending: true })
        : { data: [] };

    const pendingAthletes = (pendingAthletesData || []) as Profile[];

    // Atletas activos (con filtro de busqueda)
    let req = supabase
        .from("profiles")
        .select("*")
        .eq("role", "USER")
        .eq("is_active", true);

    if (query) {
        req = req.or(`full_name.ilike.%${query}%,cedula.ilike.%${query}%`);
    }

    const { data: athletesData } = await req.order("full_name");

    const athletes = (athletesData || []) as Profile[];

    // Stats
    const activeCount = athletes.length;
    const inactiveCount = pendingAthletes.length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Atletas</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Gestiona los atletas del box. <span className="font-medium text-indigo-600">{activeCount} activos</span>
                        {inactiveCount > 0 && (
                            <span className="text-yellow-400 ml-2">{inactiveCount} pendientes de activacion</span>
                        )}
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <SearchInput placeholder="Buscar por nombre..." />
                    <AthleteForm
                    trigger={
                        <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white">
                            + Nuevo Atleta
                        </Button>
                    }
                />
                </div>
            </div>

            {/* Seccion: Atletas nuevos pendientes (solo SUPERADMIN) */}
            {isSuperAdmin && pendingAthletes.length > 0 && (
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border-b border-blue-500/20">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20">
                            <UserPlus className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-blue-300">Atletas nuevos &mdash; pendientes de activacion</p>
                            <p className="text-xs text-blue-400/70">{pendingAthletes.length} cuenta{pendingAthletes.length !== 1 ? "s" : ""} esperando aprobacion</p>
                        </div>
                    </div>
                    <div className="divide-y divide-border/50">
                        {pendingAthletes.map((athlete) => (
                            <div key={athlete.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-xs font-bold text-blue-400">
                                        {(athlete.full_name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-foreground text-sm">{athlete.full_name || "Sin nombre"}</p>
                                        <div className="flex flex-wrap gap-2 mt-0.5">
                                            {athlete.cedula && (
                                                <span className="text-xs text-muted-foreground font-mono">CI: {athlete.cedula}</span>
                                            )}
                                            {athlete.phone && (
                                                <a
                                                    href={`https://wa.me/58${athlete.phone.replace(/\D/g, "").slice(-10)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-green-500 hover:text-green-400"
                                                >
                                                    {athlete.phone}
                                                </a>
                                            )}
                                            <span className="text-xs text-muted-foreground/60">
                                                Registrado: {new Date(athlete.created_at).toLocaleDateString("es-VE")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 pl-12 sm:pl-0">
                                    <Link href={`/admin/athletes/${athlete.id}`}>
                                        <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
                                            Ver perfil
                                        </Button>
                                    </Link>
                                    <ActivateAthleteButton
                                        athleteId={athlete.id}
                                        athleteName={athlete.full_name || "Atleta"}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {athletes.length > 0 ? (
                <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Nombre</TableHead>
                                <TableHead>Cédula</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead className="hidden lg:table-cell">Pago Siguiente</TableHead>
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
                                    <TableCell className="text-muted-foreground font-mono text-sm">
                                        {athlete.cedula || <span className="text-muted-foreground/40 italic">Sin cédula</span>}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {athlete.phone ? (
                                            <a href={`https://wa.me/58${athlete.phone.replace(/\D/g, "").slice(-10)}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors flex items-center gap-1">
                                                {athlete.phone}
                                            </a>
                                        ) : "—"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm hidden lg:table-cell">
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
