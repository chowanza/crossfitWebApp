"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import type { PersonalRecord } from "@/lib/types/database";

interface PrHistoryDialogProps {
    movementName: string;
    records: PersonalRecord[];
}

export function PrHistoryDialog({ movementName, records }: PrHistoryDialogProps) {
    if (records.length === 0) return null;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="link" className="text-xs text-indigo-600 hover:text-indigo-700 h-auto p-0 mt-1 flex items-center gap-1">
                    <History className="w-3 h-3" />
                    Ver historial ({records.length})
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Historial: {movementName}</DialogTitle>
                    <DialogDescription>
                        Todos tus registros para este movimiento ordenados por fecha.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {records.map((record) => (
                        <div
                            key={record.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border bg-muted/20 gap-2"
                        >
                            <div>
                                <p className="font-bold text-lg text-indigo-600">
                                    {record.weight_value} <span className="text-sm font-normal text-muted-foreground">kg</span>
                                    {record.reps > 1 && <span className="text-sm font-medium ml-2 text-foreground">× {record.reps} reps</span>}
                                </p>
                                {record.notes && (
                                    <p className="text-sm text-muted-foreground mt-1 italic">"{record.notes}"</p>
                                )}
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-xs font-medium bg-muted px-2 py-1 rounded w-fit sm:w-auto inline-block">
                                    {new Date(record.created_at).toLocaleDateString("es-VE", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
