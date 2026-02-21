import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile, Wod } from "@/lib/types/database";
import { WodForm } from "@/components/wod-form";
import { DeleteWodButton } from "@/components/delete-wod-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

    // Verificar que es admin
    const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user!.id)
        .single();

    const profile = profileData as Pick<Profile, "role"> | null;
    if (profile?.role !== "ADMIN") {
        redirect("/");
    }

    const { data: wodsData } = await supabase
        .from("wods")
        .select("*")
        .order("date", { ascending: false })
        .limit(50);

    const wods = (wodsData || []) as Wod[];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Gestionar WODs</h2>
                    <p className="text-zinc-400 text-sm mt-1">Crea y administra las rutinas diarias.</p>
                </div>
                <WodForm
                    trigger={
                        <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                            + Nuevo WOD
                        </Button>
                    }
                />
            </div>

            {wods.length > 0 ? (
                <div className="rounded-lg border border-zinc-800 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Fecha</TableHead>
                                <TableHead className="text-zinc-400">Título</TableHead>
                                <TableHead className="text-zinc-400">Tipo</TableHead>
                                <TableHead className="text-zinc-400 hidden md:table-cell">
                                    Descripción
                                </TableHead>
                                <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {wods.map((wod) => (
                                <TableRow key={wod.id} className="border-zinc-800">
                                    <TableCell className="text-zinc-300 font-mono text-sm">
                                        {wod.date}
                                    </TableCell>
                                    <TableCell className="text-white font-medium">
                                        {wod.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="border-amber-500/30 text-amber-500"
                                        >
                                            {wod.wod_type.replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-zinc-400 text-sm max-w-xs truncate hidden md:table-cell">
                                        {wod.description}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <WodForm
                                                wod={wod}
                                                trigger={
                                                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
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
                <div className="rounded-lg border border-zinc-800 border-dashed py-12 text-center">
                    <p className="text-zinc-500">No hay WODs creados aún.</p>
                    <p className="text-zinc-600 text-sm mt-1">Crea el primer WOD para tus atletas.</p>
                </div>
            )}
        </div>
    );
}
