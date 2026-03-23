/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Profile, Movement } from "@/lib/types/database";
import { WodForm } from "@/components/wod-form";
import { DeleteWodButton } from "@/components/delete-wod-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function AdminWodsPage() {
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

    // Obtener movimientos para el formulario
    const { data: movementsData } = await supabase
        .from("movements")
        .select("*")
        .order("name");
    const movements = (movementsData || []) as Movement[];

    // Obtener WODs con sus secciones y movimientos
    const { data: wodsData } = await supabase
        .from("wods")
        .select(`
            *,
            wod_sections (
                *,
                wod_section_movements (*)
            )
        `)
        .order("date", { ascending: false })
        .limit(50);

    // Tipar manualmente el resultado compuesto
    const wods = wodsData as any[] || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Gestionar WODs</h2>
                    <p className="text-muted-foreground text-sm mt-1">Crea y administra las rutinas diarias.</p>
                </div>
                <Link href="/admin/wods/builder">
                    <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-sm">
                        + Nueva Rutina
                    </Button>
                </Link>
            </div>

            {wods.length > 0 ? (
                <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Fecha</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Bloques</TableHead>
                                <TableHead className="hidden md:table-cell">
                                    Notas
                                </TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {wods.map((wod) => (
                                <TableRow key={wod.id}>
                                    <TableCell className="font-mono text-sm">
                                        {wod.date}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {wod.title}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {wod.wod_sections?.sort((a: any, b: any) => a.order_index - b.order_index).map((sec: any) => (
                                                <Badge
                                                    key={sec.id}
                                                    variant="secondary"
                                                    className="text-xs bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/20"
                                                >
                                                    {sec.section_type.replace("_", " ")}
                                                </Badge>
                                            ))}
                                            {(!wod.wod_sections || wod.wod_sections.length === 0) && (
                                                <span className="text-muted-foreground text-xs">Sin bloques</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm max-w-xs truncate hidden md:table-cell">
                                        {wod.notes}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <WodForm
                                                wod={wod}
                                                movements={movements}
                                                trigger={
                                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                                        Editar
                                                    </Button>
                                                }
                                            />
                                            <DeleteWodButton wodId={wod.id} wodTitle={wod.title} />
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
                        <Dumbbell className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-lg">No hay WODs programados</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Crea el primer entrenamiento para que tus atletas puedan registrar sus marcas.
                    </p>
                </div>
            )}
        </div>
    );
}
