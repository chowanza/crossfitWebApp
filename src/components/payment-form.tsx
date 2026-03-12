"use client";

import { useState } from "react";
import { registerPayment } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import type { Profile } from "@/lib/types/database";

interface PaymentFormProps {
    athletes: Pick<Profile, "id" | "full_name">[];
    trigger: React.ReactNode;
    defaultUserId?: string;
}

export function PaymentForm({ athletes, trigger, defaultUserId }: PaymentFormProps) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Defaults: período del mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = await registerPayment(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setOpen(false);
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar Pago</DialogTitle>
                    <DialogDescription>
                        Registra el pago de mensualidad de un atleta.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Atleta</Label>
                        <Select name="user_id" defaultValue={defaultUserId}>
                            <SelectTrigger className="bg-muted/50">
                                <SelectValue placeholder="Selecciona un atleta" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                {athletes.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.full_name || "Sin nombre"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Monto</Label>
                        <Input
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Ej: 30.00"
                            required
                            className="bg-muted/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Período Inicio</Label>
                            <Input
                                name="period_start"
                                type="date"
                                defaultValue={firstDay}
                                required
                                className="bg-muted/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Período Fin</Label>
                            <Input
                                name="period_end"
                                type="date"
                                defaultValue={lastDay}
                                required
                                className="bg-muted/50"
                            />
                        </div>
                    </div>

                    <input type="hidden" name="status" value="PAID" />

                    <div className="space-y-2">
                        <Label>Notas (opcional)</Label>
                        <Textarea
                            name="notes"
                            placeholder="Método de pago, referencia, etc."
                            rows={2}
                            className="bg-muted/50 resize-none"
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="text-muted-foreground"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isLoading={loading}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                        >
                            {loading ? "Registrando..." : "Registrar Pago"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
