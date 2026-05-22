"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type Status = "loading" | "ready" | "error";

export default function UpdatePasswordPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<Status>("loading");
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();

        async function initSession() {
            // 1. @supabase/ssr NO procesa el hash automáticamente.
            //    Debemos leerlo nosotros y llamar setSession() manualmente.
            const hash = window.location.hash.substring(1); // quitar el "#"
            const params = new URLSearchParams(hash);

            const accessToken  = params.get("access_token");
            const refreshToken = params.get("refresh_token");
            const type         = params.get("type");

            if (accessToken && refreshToken && type === "recovery") {
                // Establecer la sesión en el cliente con los tokens del hash
                const { error } = await supabase.auth.setSession({
                    access_token:  accessToken,
                    refresh_token: refreshToken,
                });

                if (error) {
                    console.error("setSession error:", error.message);
                    setStatus("error");
                    return;
                }

                // Limpiar el hash de la URL para que no quede el token visible
                window.history.replaceState(null, "", window.location.pathname);
                setStatus("ready");
                return;
            }

            // 2. Fallback: si ya había una sesión activa (ej: recarga de página)
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setStatus("ready");
                return;
            }

            // 3. No hay token válido
            setStatus("error");
        }

        initSession();
    }, []);

    async function handleSubmit(formData: FormData) {
        setLoading(true);

        const password   = formData.get("password") as string;
        const confirmStr = formData.get("confirmPassword") as string;

        if (password !== confirmStr) {
            toast.error("Las contraseñas no coinciden.");
            setLoading(false);
            return;
        }

        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            toast.error(error.message);
            setLoading(false);
        } else {
            await supabase.auth.signOut();
            toast.success("¡Contraseña actualizada! Inicia sesión con tu nueva clave.");
            router.push("/login");
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background relative overflow-hidden">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-border shadow-2xl bg-card/60 backdrop-blur-xl">
                    <CardHeader className="text-center space-y-3 pb-6">
                        <div className="relative mb-2">
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                            <div className="mx-auto bg-gradient-to-tr from-indigo-500/20 to-violet-500/10 p-4 rounded-full relative border border-indigo-500/30 shadow-inner w-16 h-16 flex items-center justify-center">
                                <KeyRound className="h-8 w-8 text-indigo-400" />
                            </div>
                        </div>
                        <div className="pt-2">
                            <CardTitle className="text-3xl font-black tracking-tight">
                                Nueva Contraseña
                            </CardTitle>
                            <CardDescription className="text-base mt-2 text-muted-foreground">
                                Crea una clave segura. Evita usar la misma contraseña de otros sitios.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {status === "loading" && (
                            <div className="flex flex-col items-center gap-3 py-8">
                                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                                <p className="text-sm text-muted-foreground animate-pulse">
                                    Verificando enlace de recuperación...
                                </p>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="flex flex-col items-center gap-4 py-6">
                                <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
                                    <AlertCircle className="h-7 w-7 text-red-400" />
                                </div>
                                <p className="text-sm text-center text-muted-foreground">
                                    El enlace es inválido o ya expiró.
                                </p>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => router.push("/forgot-password")}
                                >
                                    Solicitar un nuevo enlace
                                </Button>
                            </div>
                        )}

                        {status === "ready" && (
                            <form action={handleSubmit} className="space-y-6">
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="password" className="text-sm font-semibold text-foreground/80">
                                        Nueva contraseña
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        minLength={6}
                                        required
                                        className="h-12 bg-background/50 border-border/50 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all px-4 text-md font-mono tracking-widest"
                                    />
                                </div>

                                <div className="space-y-2 text-left">
                                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground/80">
                                        Confirmar contraseña
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        minLength={6}
                                        required
                                        className="h-12 bg-background/50 border-border/50 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all px-4 text-md font-mono tracking-widest"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-md shadow-lg shadow-indigo-500/25 transition-all group overflow-hidden relative"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {loading ? "Guardando..." : (
                                            <>
                                                Guardar y continuar
                                                <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
