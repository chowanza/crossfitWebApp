import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "@/lib/types/database";

const STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
    PAID: {
        label: "Pagado",
        className: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    PENDING: {
        label: "Pendiente",
        className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    OVERDUE: {
        label: "Vencido",
        className: "bg-red-500/20 text-red-400 border-red-500/30",
    },
    CANCELLED: {
        label: "Cancelado",
        className: "bg-muted/40 text-muted-foreground border-border",
    },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
    const config = STATUS_CONFIG[status];
    return (
        <Badge variant="outline" className={config.className}>
            {config.label}
        </Badge>
    );
}
