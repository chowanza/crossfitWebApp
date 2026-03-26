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
import { MovementMediaDialog } from "@/components/movement-media-dialog";
import { SearchInput } from "@/components/search-input";

const CATEGORY_LABELS: Record<string, string> = {
    WEIGHTLIFTING: "Halterofilia",
    GYMNASTICS: "Gimnásticos",
    CARDIO: "Cardio",
    OTHER: "Otros",
};

const CATEGORY_COLORS: Record<string, string> = {
    WEIGHTLIFTING: "border-red-500/30 text-red-500",
    GYMNASTICS: "border-indigo-600/30 text-indigo-600",
    CARDIO: "border-green-500/30 text-green-500",
    OTHER: "border-muted-foreground/30 text-muted-foreground",
};

export default async function AdminMovementsPage(props: { searchParams?: Promise<{ query?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || "";
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
    if (profile?.role !== "ADMIN" && profile?.role !== "SUPERADMIN") redirect("/");

    let req = supabase
        .from("movements")
        .select("*");

    if (query) {
        req = req.ilike("name", `%${query}%`);
    }

    const { data: movementsData } = await req.order("category").order("name");

    const movements = (movementsData || []) as Movement[];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Movimientos</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Catálogo de movimientos básicos de CrossFit.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <SearchInput placeholder="Buscar ejercicio..." />
                    <MovementForm
                        trigger={
                            <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white">
                                + Nuevo
                            </Button>
                        }
                    />
                </div>
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
                                                <MovementMediaDialog
                                                    movementName={movement.name}
                                                    mediaUrl={movement.media_url}
                                                />
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
                                    <TableCell className="text-right py-3">
                                        <div className="flex items-center justify-end flex-wrap gap-1 sm:gap-2">
                                            <MovementForm
                                                movement={movement}
                                                trigger={
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-muted-foreground hover:text-foreground px-2"
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
