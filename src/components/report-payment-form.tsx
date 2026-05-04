"use client";

import { useState } from "react";
import { reportAthletePayment } from "@/actions/payments";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ReportPaymentFormProps {
    trigger: React.ReactNode;
}

export function ReportPaymentForm({ trigger }: ReportPaymentFormProps) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Defaults: período del mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = await reportAthletePayment(formData);
        
        if (result?.error) {
            setError(result.error);
            toast.error("Error al reportar el pago");
            setLoading(false);
        } else {
            toast.success("Pago reportado exitosamente. En espera de verificación.");
            setOpen(false);
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Reportar Pago</DialogTitle>
                    <DialogDescription>
                        Sube tu comprobante de pago para que sea verificado.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Método de Pago</Label>
                            <select
                                name="payment_method"
                                className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                required
                            >
                                <option value="Transferencia">Transferencia</option>
                                <option value="Pago Móvil">Pago Móvil</option>
                                <option value="Zelle">Zelle</option>
                                <option value="Binance / USDT">Binance / USDT</option>
                                <option value="Efectivo ($)">Efectivo ($)</option>
                                <option value="Efectivo (Bs)">Efectivo (Bs)</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Referencia (opc.)</Label>
                            <Input
                                name="reference"
                                placeholder="Ej: 193859"
                                className="bg-muted/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Comprobante de Pago</Label>
                        <div className="flex items-center gap-3">
                            <Input
                                name="receipt_file"
                                type="file"
                                accept="image/*,.pdf"
                                required
                                className="bg-muted/50 file:text-indigo-600 file:font-semibold"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Concepto Adicional (opcional)</Label>
                        <Textarea
                            name="notes"
                            placeholder="Ej. Mensualidad Abril"
                            rows={2}
                            className="bg-muted/50 resize-none"
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
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
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {loading ? "Enviando..." : "Enviar Comprobante"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
