"use client";

import { useState } from "react";
import { deleteCoach } from "@/actions/coaches";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";

export function DeleteCoachButton({ id, name }: { id: string; name: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        setLoading(true);
        const result = await deleteCoach(id);
        
        if (result?.error) {
            alert(result.error);
        }
        
        setLoading(false);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="text-sm font-medium text-red-500 hover:text-red-600 hover:underline">
                    Eliminar
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>¿Está absolutamente seguro?</DialogTitle>
                    <DialogDescription>
                        Esta acción no se puede deshacer. Eliminará permanentemente la
                        cuenta del entrenador <strong className="text-foreground">{name}</strong> y removerá
                        sus datos de nuestros servidores.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={loading}>Cancelar</Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? "Eliminando..." : "Sí, eliminar entrenador"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
