"use client";

import { useState } from "react";
import { updatePaymentStatus } from "@/actions/payments";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface PendingPaymentActionsProps {
    id: string;
    athleteName: string;
    amount: number;
}

export function PendingPaymentActions({ id, athleteName, amount }: PendingPaymentActionsProps) {
    const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

    async function handleApprove() {
        if (!confirm(`¿Confirmar el pago de $${amount} de ${athleteName}? Se le notificará por correo.`)) return;
        setLoading("approve");
        const result = await updatePaymentStatus(id, "PAID");
        if (result?.error) {
            toast.error("Error al aprobar: " + result.error);
        } else {
            toast.success(`✅ Pago de ${athleteName} aprobado. Se notificó al atleta.`);
        }
        setLoading(null);
    }

    async function handleReject() {
        if (!confirm(`¿Rechazar el comprobante de $${amount} de ${athleteName}? El atleta será notificado.`)) return;
        setLoading("reject");
        const result = await updatePaymentStatus(id, "OVERDUE");
        if (result?.error) {
            toast.error("Error al rechazar: " + result.error);
        } else {
            toast.warning(`⚠️ Comprobante de ${athleteName} marcado como no procesado.`);
        }
        setLoading(null);
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                size="sm"
                onClick={handleApprove}
                disabled={loading !== null}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 text-xs font-semibold gap-1.5"
            >
                {loading === "approve" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <CheckCircle className="h-3.5 w-3.5" />
                )}
                {loading === "approve" ? "Aprobando..." : "Aprobar"}
            </Button>
            <Button
                size="sm"
                variant="ghost"
                onClick={handleReject}
                disabled={loading !== null}
                className="border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-8 px-3 text-xs font-semibold gap-1.5"
            >
                {loading === "reject" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <XCircle className="h-3.5 w-3.5" />
                )}
                {loading === "reject" ? "Rechazando..." : "Rechazar"}
            </Button>
        </div>
    );
}
