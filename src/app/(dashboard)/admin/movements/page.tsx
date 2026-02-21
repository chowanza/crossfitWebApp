import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile, Movement } from "@/lib/types/database";
import { MovementForm } from "@/components/movement-form";
import { DeleteMovementButton } from "@/components/delete-movement-button";
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

const CATEGORY_LABELS: Record<string, string> = {
    WEIGHTLIFTING: "Halterofilia",
    GYMNASTICS: "Gimnásticos",
    CARDIO: "Cardio",
    OTHER: "Otros",
};

const CATEGORY_COLORS: Record<string, string> = {
    WEIGHTLIFTING: "border-red-500/30 text-red-400",
    GYMNASTICS: "border-blue-500/30 text-blue-400",
    CARDIO: "border-green-500/30 text-green-400",
    OTHER: "border-zinc-500/30 text-zinc-400",
};

export default async function AdminMovementsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user!.id)
        .single();

    const profile = profileData as Pick<Profile, "role"> | null;
    if (profile?.role !== "ADMIN") redirect("/");

    const { data: movementsData } = await supabase
        .from("movements")
        .select("*")
        .order("category")
        .order("name");

    const movements = (movementsData || []) as Movement[];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Movimientos</h2>
                    <p className="text-zinc-400 text-sm mt-1">
                        Catálogo de movimientos básicos de CrossFit.
                    </p>
                </div>
                <MovementForm
                    trigger={
                        <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                            + Nuevo
                        </Button>
                    }
                />
            </div>

            {movements.length > 0 ? (
                <div className="rounded-lg border border-zinc-800 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Nombre</TableHead>
                                <TableHead className="text-zinc-400">Categoría</TableHead>
                                <TableHead className="text-zinc-400 hidden md:table-cell">
                                    Descripción
                                </TableHead>
                                <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {movements.map((movement) => (
                                <TableRow key={movement.id} className="border-zinc-800">
                                    <TableCell className="text-white font-medium">
                                        {movement.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={CATEGORY_COLORS[movement.category]}
                                        >
                                            {CATEGORY_LABELS[movement.category]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-zinc-400 text-sm max-w-xs truncate hidden md:table-cell">
                                        {movement.description}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <MovementForm
                                                movement={movement}
                                                trigger={
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-zinc-400 hover:text-white"
                                                    >
                                                        Editar
                                                    </Button>
                                                }
                                            />
                                            <DeleteMovementButton
                                                movementId={movement.id}
                                                movementName={movement.name}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="rounded-lg border border-zinc-800 border-dashed py-12 text-center">
                    <p className="text-zinc-500">No hay movimientos registrados.</p>
                </div>
            )}
        </div>
    );
}
