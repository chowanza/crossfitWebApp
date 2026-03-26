"use client";

import { useState } from "react";
import { resetPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await resetPassword(formData);
        
        if (result?.error) {
            setError(result.error);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="w-full max-w-md px-4">
                    <Card className="text-center py-6">
                        <CardHeader>
                            <div className="mx-auto mb-4 bg-green-500/10 p-4 rounded-full inline-block">
                                <MailCheck className="w-10 h-10 text-green-500" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Correo enviado</CardTitle>
                            <CardDescription className="text-base mt-2">
                                Revisa tu bandeja de entrada o la carpeta de spam. Te hemos enviado un enlace para restablecer tu contraseña.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Link href="/login">
                                <Button variant="outline" className="w-full h-11">
                                    Volver al inicio de sesión
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md px-4">
                <Card>
                    <CardHeader className="space-y-2">
                        <Link href="/login" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground w-fit transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </Link>
                        <CardTitle className="text-2xl font-bold">
                            Recuperar Contraseña
                        </CardTitle>
                        <CardDescription>
                            Ingresa tu correo electrónico y te enviaremos un enlace para crear una nueva contraseña.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email de la cuenta</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="tu@email.com"
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
                                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold h-11 mt-2"
                            >
                                {loading ? "Enviando enlace..." : "Enviar enlace de recuperación"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
