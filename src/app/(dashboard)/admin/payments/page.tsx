import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile, Payment } from "@/lib/types/database";
import { PaymentForm } from "@/components/payment-form";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface PaymentWithProfile extends Payment {
    profiles: Pick<Profile, "full_name"> | null;
}

export default async function AdminPaymentsPage({
    searchParams,
}: {
    searchParams: Promise<{ filter?: string }>;
}) {
    const { filter } = await searchParams;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Verificar admin
    const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user!.id)
        .single();

    const profile = profileData as Pick<Profile, "role"> | null;
    if (profile?.role !== "ADMIN") redirect("/");

    // Todos los atletas (para el form)
    const { data: athletesData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "USER")
        .order("full_name");

    const athletes = (athletesData || []) as Pick<Profile, "id" | "full_name">[];

    // Pagos con filtro opcional
    let query = supabase
        .from("payments")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(100);

    if (filter === "overdue") {
        query = query.eq("status", "OVERDUE");
    } else if (filter === "paid") {
        query = query.eq("status", "PAID");
    } else if (filter === "pending") {
        query = query.eq("status", "PENDING");
    }

    const { data: paymentsData } = await query;
    const payments = (paymentsData || []) as PaymentWithProfile[];

    // Stats rápidas
    const { count: overdueCount } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("status", "OVERDUE");

    const { count: pendingCount } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("status", "PENDING");

    const currentFilter = filter || "all";

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Pagos</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Gestiona las mensualidades de los atletas.
                    </p>
                </div>
                <PaymentForm
                    athletes={athletes}
                    trigger={
                        <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white">
                            + Registrar Pago
                        </Button>
                    }
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="border-border bg-muted/10">
                    <CardContent className="pt-5 pb-4 text-center">
                        <p className="text-2xl font-bold text-red-500">{overdueCount ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Vencidos</p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-muted/10">
                    <CardContent className="pt-5 pb-4 text-center">
                        <p className="text-2xl font-bold text-yellow-500">{pendingCount ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Pendientes</p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-muted/10">
                    <CardContent className="pt-5 pb-4 text-center">
                        <p className="text-2xl font-bold text-green-500">{athletes.length}</p>
                        <p className="text-xs text-muted-foreground">Atletas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { value: "all", label: "Todos" },
                    { value: "overdue", label: "Vencidos" },
                    { value: "pending", label: "Pendientes" },
                    { value: "paid", label: "Pagados" },
                ].map((f) => (
                    <a
                        key={f.value}
                        href={f.value === "all" ? "/admin/payments" : `/admin/payments?filter=${f.value}`}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${currentFilter === f.value
                            ? "bg-indigo-600/20 text-indigo-600"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                    >
                        {f.label}
                    </a>
                ))}
            </div>

            {/* Tabla */}
            {payments.length > 0 ? (
                <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                                <TableHead className="text-muted-foreground">Atleta</TableHead>
                                <TableHead className="text-muted-foreground">Monto</TableHead>
                                <TableHead className="text-muted-foreground">Período</TableHead>
                                <TableHead className="text-muted-foreground">Estado</TableHead>
                                <TableHead className="text-muted-foreground hidden md:table-cell">Fecha</TableHead>
                                <TableHead className="text-muted-foreground hidden md:table-cell">Notas</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id} className="border-border">
                                    <TableCell className="text-foreground font-medium">
                                        {payment.profiles?.full_name || "—"}
                                    </TableCell>
                                    <TableCell className="text-foreground/80 font-mono">
                                        ${payment.amount}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {payment.period_start} → {payment.period_end}
                                    </TableCell>
                                    <TableCell>
                                        <PaymentStatusBadge status={payment.status} />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground/80 text-sm hidden md:table-cell">
                                        {payment.payment_date}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground/80 text-sm max-w-xs truncate hidden md:table-cell">
                                        {payment.notes}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="rounded-xl border border-border border-dashed py-16 flex flex-col items-center justify-center text-center bg-muted/5">
                    <div className="bg-muted p-4 rounded-full mb-4">
                        <CreditCard className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-lg text-foreground/90">
                        {currentFilter !== "all"
                            ? `No hay pagos con estado "${currentFilter}".`
                            : "No hay pagos registrados aún."}
                    </p>
                    {currentFilter === "all" && (
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            Registra el primer pago para llevar el control financiero de tus atletas.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
