"use client";

import { useState } from "react";
import { updatePaymentStatus, deletePayment } from "@/actions/payments";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import type { PaymentStatus } from "@/lib/types/database";

export function PaymentActions({ id, currentStatus }: { id: string; currentStatus: PaymentStatus }) {
    const [loading, setLoading] = useState(false);

    async function handleStatusChange(status: PaymentStatus) {
        setLoading(true);
        const result = await updatePaymentStatus(id, status);
        if (result?.error) toast.error("Error al cambiar estado: " + result.error);
        else toast.success("Estado actualizado a " + status);
        setLoading(false);
    }

    async function handleDelete() {
        if (!confirm("¿Seguro que deseas eliminar este recibo de pago de forma permanente? Esta acción no se puede deshacer.")) return;
        setLoading(true);
        const result = await deletePayment(id);
        if (result?.error) toast.error("Error al eliminar recibo: " + result.error);
        else toast.success("Recibo de pago eliminado exitosamente");
        setLoading(false);
    }

    return (
        <div className="flex items-center justify-end gap-1">
            {currentStatus !== "PAID" && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Marcar como Pagado"
                    className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10" 
                    onClick={() => handleStatusChange("PAID")} 
                    disabled={loading}
                >
                    <CheckCircle className="h-4 w-4" />
                </Button>
            )}
            {currentStatus !== "PENDING" && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Marcar como Pendiente"
                    className="h-8 w-8 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10" 
                    onClick={() => handleStatusChange("PENDING")} 
                    disabled={loading}
                >
                    <Clock className="h-4 w-4" />
                </Button>
            )}
            {currentStatus !== "OVERDUE" && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Marcar como Vencido"
                    className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10" 
                    onClick={() => handleStatusChange("OVERDUE")} 
                    disabled={loading}
                >
                    <AlertCircle className="h-4 w-4" />
                </Button>
            )}
            <div className="w-[1px] h-4 bg-border mx-1"></div>
            <Button 
                variant="ghost" 
                size="icon" 
                title="Eliminar Pago"
                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10" 
                onClick={handleDelete} 
                disabled={loading}
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
        </div>
    );
}
