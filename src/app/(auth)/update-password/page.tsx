"use client";

import { useState } from "react";
import { updatePassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function UpdatePasswordPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        
        const password = formData.get("password") as string;
        const confirmStr = formData.get("confirmPassword") as string;
        
        if (password !== confirmStr) {
            toast.error("Las contraseñas no coinciden.");
            setLoading(false);
            return;
        }

        const result = await updatePassword(formData);
        
        if (result?.error) {
            toast.error(result.error);
            setLoading(false);
        } else {
            toast.success("¡Contraseña actualizada con éxito!");
            router.push("/");
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background Blobs */}
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
                        <form action={handleSubmit} className="space-y-6">
                            <div className="space-y-2 text-left">
                                <Label htmlFor="password" className="text-sm font-semibold text-foreground/80">Nueva contraseña</Label>
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
                                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground/80">Confirmar contraseña</Label>
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
                                    {loading ? (
                                        "Guardando..."
                                    ) : (
                                        <>
                                            Guardar y continuar
                                            <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
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
