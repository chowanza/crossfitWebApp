"use client";

import { useState } from "react";
import { register } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await register(formData);
        
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            toast.success("Registro exitoso. Revisa tu correo para verificar tu cuenta.");
            router.push("/login");
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
                            Crear Cuenta
                        </CardTitle>
                        <CardDescription>
                            Únete a Iron Fit Venezuela
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Nombre Completo</Label>
                                <Input
                                    id="full_name"
                                    name="full_name"
                                    type="text"
                                    placeholder="Ej: Juan Pérez"
                                    required
                                />
                            </div>
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
                                <Label htmlFor="password">Contraseña</Label>
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
                                {loading ? "Creando cuenta..." : "Registrarme"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    ¿Ya tienes cuenta?{" "}
                    <Link href="/login" className="text-indigo-600 hover:text-indigo-500 hover:underline font-medium transition-colors">
                        Inicia sesión aquí
                    </Link>
                </p>
            </div>
        </div>
    );
}
