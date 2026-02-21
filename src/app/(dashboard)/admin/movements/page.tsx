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
import { Image as ImageIcon } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
    WEIGHTLIFTING: "Halterofilia",
    GYMNASTICS: "Gimnásticos",
    CARDIO: "Cardio",
    OTHER: "Otros",
};

const CATEGORY_COLORS: Record<string, string> = {
    WEIGHTLIFTING: "border-red-500/30 text-red-500",
    GYMNASTICS: "border-blue-500/30 text-blue-500",
    CARDIO: "border-green-500/30 text-green-500",
    OTHER: "border-muted-foreground/30 text-muted-foreground",
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
                    <p className="text-muted-foreground text-sm mt-1">
                        Catálogo de movimientos básicos de CrossFit.
                    </p>
                </div>
                <MovementForm
                    trigger={
                        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                            + Nuevo
                        </Button>
                    }
                />
            </div>

            {movements.length > 0 ? (
                <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                                <TableHead className="text-muted-foreground">Nombre</TableHead>
                                <TableHead className="text-muted-foreground">Categoría</TableHead>
                                <TableHead className="text-muted-foreground hidden md:table-cell">
                                    Descripción
                                </TableHead>
                                <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {movements.map((movement) => (
                                <TableRow key={movement.id} className="border-border">
                                    <TableCell className="text-foreground font-medium">
                                        <div className="flex items-center gap-2">
                                            {movement.name}
                                            {movement.media_url && (
                                                <a href={movement.media_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-500" title="Ver media">
                                                    <ImageIcon className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={CATEGORY_COLORS[movement.category]}
                                        >
                                            {CATEGORY_LABELS[movement.category]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm max-w-xs truncate hidden md:table-cell">
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
                                                        className="text-muted-foreground hover:text-foreground"
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
                <div className="rounded-lg border border-border border-dashed py-12 text-center bg-muted/5">
                    <p className="text-muted-foreground">No hay movimientos registrados.</p>
                </div>
            )}
        </div>
    );
}
