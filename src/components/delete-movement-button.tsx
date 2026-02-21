"use client";

import { useState } from "react";
import { deleteMovement } from "@/actions/movements";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteMovementButtonProps {
    movementId: string;
    movementName: string;
}

export function DeleteMovementButton({
    movementId,
    movementName,
}: DeleteMovementButtonProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        setLoading(true);
        await deleteMovement(movementId);
        setOpen(false);
        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                    Eliminar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>¿Eliminar movimiento?</DialogTitle>
                    <DialogDescription>
                        Vas a eliminar{" "}
                        <span className="text-foreground font-medium">
                            &ldquo;{movementName}&rdquo;
                        </span>
                        . Se eliminarán también todos los PRs asociados.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-4">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="text-muted-foreground"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {loading ? "Eliminando..." : "Eliminar"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
