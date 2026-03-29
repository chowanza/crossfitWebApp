import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Phone, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth";

export default async function PaymentBlockPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Obtener el perfil con datos de pago
    const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, last_payment_date, phone, role")
        .eq("id", user.id)
        .single();

    // Obtener el teléfono de un entrenador para el botón de WhatsApp
    const { data: coachData } = await supabase
        .from("profiles")
        .select("phone, full_name")
        .eq("role", "ADMIN")
        .not("phone", "is", null)
        .limit(1)
        .single();

    const coachPhone = coachData?.phone
        ? `58${coachData.phone.replace(/\D/g, "").slice(-10)}`
        : null;

    // Si no es USER normal o si ya no tiene deuda, redirigir al dashboard
    if (!profileData || profileData.role !== "USER") redirect("/");

    const lastPay = profileData.last_payment_date
        ? new Date(profileData.last_payment_date)
        : null;

    const diffDays = lastPay
        ? Math.floor((new Date().getTime() - lastPay.getTime()) / (1000 * 60 * 60 * 24))
        : null;

    if (diffDays !== null && diffDays <= 3) redirect("/");

    const firstName = profileData.full_name?.split(" ")[0] || "Atleta";
    const dueDate = lastPay
        ? lastPay.toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" })
        : null;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            {/* Logo / Brand */}
            <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                    <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                        IRON FIT
                    </span>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Box CrossFit</p>
            </div>

            {/* Tarjeta principal */}
            <Card className="w-full max-w-md border-red-500/20 bg-card shadow-xl">
                <CardContent className="pt-8 pb-8 px-8 flex flex-col items-center text-center gap-5">
                    {/* Icono */}
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>

                    {/* Título */}
                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            Acceso suspendido
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Hola <span className="font-semibold text-foreground">{firstName}</span>,
                            tu membresía tiene un pago pendiente.
                        </p>
                    </div>

                    {/* Info deuda */}
                    {dueDate && (
                        <div className="w-full rounded-lg bg-red-500/5 border border-red-500/20 px-4 py-3">
                            <p className="text-xs text-muted-foreground">Último pago registrado</p>
                            <p className="text-sm font-semibold text-foreground mt-0.5">{dueDate}</p>
                            {diffDays !== null && (
                                <p className="text-xs text-red-500 font-medium mt-1">
                                    {diffDays} {diffDays === 1 ? "día" : "días"} de mora
                                </p>
                            )}
                        </div>
                    )}

                    {/* Instrucción */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Para reactivar tu acceso, comunícate con tu entrenador y
                        realiza el pago de tu mensualidad.
                    </p>

                    {/* Acciones: contactar coach por WhatsApp */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        {coachPhone ? (
                            <a
                                href={`https://wa.me/${coachPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1"
                            >
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
                                    <Phone className="w-4 h-4" />
                                    WhatsApp {coachData?.full_name?.split(" ")[0] || "Coach"}
                                </Button>
                            </a>
                        ) : (
                            <div className="flex-1">
                                <Button disabled className="w-full gap-2" variant="outline">
                                    <Phone className="w-4 h-4" />
                                    Contactar Coach
                                </Button>
                            </div>
                        )}
                        <Link href="/profile" className="flex-1">
                            <Button variant="outline" className="w-full gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Mi Perfil
                            </Button>
                        </Link>
                    </div>

                    {/* Footer note */}
                    <p className="text-[11px] text-muted-foreground/60">
                        Una vez registrado el pago por tu entrenador,
                        el acceso se restablece automáticamente.
                    </p>
                </CardContent>
            </Card>

            {/* Link logout */}
            <form action={logout} className="mt-6">
                <button
                    type="submit"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                >
                    Cerrar sesión
                </button>
            </form>
        </div>
    );
}
