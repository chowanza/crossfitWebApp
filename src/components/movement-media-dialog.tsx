"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PlayCircle } from "lucide-react";

interface MovementMediaDialogProps {
    movementName: string;
    mediaUrl: string;
}

export function MovementMediaDialog({ movementName, mediaUrl }: MovementMediaDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center justify-center text-muted-foreground hover:text-indigo-600 transition-colors ml-2"
                    title="Ver demostración"
                >
                    <PlayCircle className="w-5 h-5" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black/95 border-zinc-800">
                <DialogHeader className="p-4 bg-background border-b border-border">
                    <DialogTitle>{movementName}</DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-center p-4 min-h-[300px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={mediaUrl}
                        alt={`Demostración de ${movementName}`}
                        className="max-w-full max-h-[60vh] object-contain rounded-md"
                        loading="lazy"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
