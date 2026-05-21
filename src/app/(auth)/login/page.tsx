"use client";

import { useState, useEffect } from "react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();

        // 1. Escuchar por evento oficial de Supabase
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                router.push("/update-password");
            }
        });

        // 2. Respaldo manual defensivo analizando el hash de la URL directamente
        //    (Evita cualquier problema de tiempos o de eventos no disparados por el SDK)
        if (typeof window !== "undefined") {
            const hash = window.location.hash;
            if (hash.includes("type=recovery") && hash.includes("access_token=")) {
                const timer = setTimeout(() => {
                    router.push("/update-password");
                }, 800); // 800ms para asegurar que Supabase guarde las cookies de sesión
                return () => {
                    clearTimeout(timer);
                    subscription.unsubscribe();
                };
            }
        }

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await login(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md px-4">
                <Card>
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto mb-2 flex h-24 w-auto items-center justify-center">
                            <img src="/logo.png" alt="Logo" className="h-full w-full object-contain drop-shadow-lg" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            Iron Fit Venezuela
                        </CardTitle>
                        <CardDescription>
                            Inicia sesión con tu cuenta
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <Link href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-500 hover:underline font-medium transition-colors">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                isLoading={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold"
                            >
                                {loading ? "Ingresando..." : "Ingresar"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    ¿No tienes cuenta?{" "}
                    <Link href="/register" className="text-indigo-600 hover:text-indigo-500 hover:underline font-medium transition-colors">
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </div>
    );
}
