"use client";

import { useState } from "react";
import { resetPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, MailCheck, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const result = await resetPassword(formData);
        
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Correo enviado exitosamente.");
            setSuccess(true);
        }
        setLoading(false);
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-background relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
                    <Card className="text-center py-10 px-4 border-indigo-500/20 shadow-2xl bg-card/60 backdrop-blur-xl">
                        <CardHeader className="flex flex-col items-center">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                                <div className="mx-auto bg-gradient-to-tr from-green-500/20 to-emerald-500/10 p-5 rounded-full relative border border-green-500/30 shadow-inner">
                                    <MailCheck className="w-12 h-12 text-emerald-400" />
                                </div>
                            </div>
                            <CardTitle className="text-3xl font-black tracking-tight">Revisa tu correo</CardTitle>
                            <CardDescription className="text-lg mt-3 text-muted-foreground leading-relaxed">
                                Hemos enviado un enlace mágico de recuperación a tu bandeja de entrada. Revisa también la carpeta de spam.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Link href="/login" className="block w-full">
                                <Button variant="outline" className="w-full h-12 text-md font-semibold border-border hover:bg-muted/50 transition-all">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Inicio
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-border shadow-2xl bg-card/60 backdrop-blur-xl">
                    <CardHeader className="space-y-3 pb-6">
                        <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-indigo-400 w-fit transition-colors group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Regresar
                        </Link>
                        
                        <div className="pt-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Recuperación
                            </div>
                            <CardTitle className="text-3xl font-black tracking-tight">
                                ¿Olvidaste tu clave?
                            </CardTitle>
                            <CardDescription className="text-base mt-2 text-muted-foreground">
                                No te preocupes. Ingresa tu correo electrónico registrado y te ayudaremos a recuperarla.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form action={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">Correo Electrónico</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="atleta@ironfit.com"
                                    required
                                    className="h-12 bg-background/50 border-border/50 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all px-4 text-md"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-md shadow-lg shadow-indigo-500/25 transition-all group overflow-hidden relative"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? (
                                        "Enviando enlace..."
                                    ) : (
                                        <>
                                            Enviar enlace mágico
                                            <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
