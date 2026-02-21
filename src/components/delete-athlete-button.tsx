"use client";

import { useState, useTransition } from "react";
import { deleteAthlete } from "@/actions/athletes";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteAthleteButtonProps {
    athleteId: string;
    athleteName: string;
}

export function DeleteAthleteButton({
    athleteId,
    athleteName,
}: DeleteAthleteButtonProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleDelete() {
        startTransition(async () => {
            await deleteAthlete(athleteId);
            setOpen(false);
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    Eliminar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Eliminar Atleta</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro de que quieres eliminar a <strong>{athleteName}</strong>?
                        Esta acción eliminará su cuenta y todos sus datos de forma permanente.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="ghost" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        {isPending ? "Eliminando..." : "Eliminar"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
