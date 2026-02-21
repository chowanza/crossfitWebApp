"use client";

import { useState } from "react";
import { deleteWod } from "@/actions/wods";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteWodButtonProps {
    wodId: string;
    wodTitle: string;
}

export function DeleteWodButton({ wodId, wodTitle }: DeleteWodButtonProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        setLoading(true);
        await deleteWod(wodId);
        setOpen(false);
        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    Eliminar
                </Button>
            </DialogTrigger>
            <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>¿Eliminar WOD?</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Vas a eliminar <span className="text-white font-medium">&ldquo;{wodTitle}&rdquo;</span>.
                        Esta acción no se puede deshacer.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400">
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
