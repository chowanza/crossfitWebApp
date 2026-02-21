import { createClient } from "@/lib/supabase/server";
import type { Payment, Profile } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PaymentBlockedPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Obtener perfil y último pago
    const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, last_payment_date")
        .eq("id", user!.id)
        .single();

    const profile = profileData as Pick<Profile, "full_name" | "last_payment_date"> | null;

    const { data: lastPayment } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user!.id)
        .order("period_end", { ascending: false })
        .limit(1)
        .single();

    const payment = lastPayment as Payment | null;

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Card className="border-border bg-card shadow-lg max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-3xl">
                        ⚠️
                    </div>
                    <CardTitle className="text-xl">
                        Acceso Restringido
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        Hola <span className="text-foreground font-medium">{profile?.full_name || "Atleta"}</span>,
                        tu mensualidad se encuentra vencida.
                    </p>

                    {payment && (
                        <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm border border-border">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Período</span>
                                <span className="text-foreground">
                                    {payment.period_start} → {payment.period_end}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Monto</span>
                                <span className="text-foreground font-mono">${payment.amount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Estado</span>
                                <span className="text-red-500 font-medium">Vencido</span>
                            </div>
                        </div>
                    )}

                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                        <p className="text-sm text-blue-400">
                            Para reactivar tu acceso, comunícate con tu entrenador para
                            registrar tu pago.
                        </p>
                    </div>

                    <p className="text-xs text-muted-foreground/70">
                        Último pago registrado: {profile?.last_payment_date || "Ninguno"}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
