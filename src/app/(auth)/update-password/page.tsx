"use client";

import { useState } from "react";
import { updatePassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function UpdatePasswordPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        
        const password = formData.get("password") as string;
        const confirmStr = formData.get("confirmPassword") as string;
        
        if (password !== confirmStr) {
            setError("Las contraseñas no coinciden.");
            setLoading(false);
            return;
        }

        const result = await updatePassword(formData);
        
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
        // If success, the action calls redirect("/") automatically
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md px-4">
                <Card>
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center bg-indigo-600/10 rounded-full">
                            <KeyRound className="h-8 w-8 text-indigo-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            Nueva contraseña
                        </CardTitle>
                        <CardDescription>
                            Crea una nueva contraseña segura para tu cuenta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Nueva contraseña</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    minLength={6}
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    minLength={6}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                isLoading={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold h-11 mt-2"
                            >
                                {loading ? "Guardando..." : "Actualizar contraseña"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
