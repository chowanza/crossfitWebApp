"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Clock } from "lucide-react";
import { logout } from "@/actions/auth";

export default function PendingApprovalPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md px-4">
                <Card className="text-center">
                    <CardHeader className="space-y-2">
                        <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
                            <Clock className="h-10 w-10" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            Cuenta en Revisión
                        </CardTitle>
                        <CardDescription>
                            Tu cuenta ha sido creada exitosamente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            Para garantizar la seguridad del Box, un entrenador debe validar tu perfil antes de que puedas acceder a la plataforma.
                        </p>
                        <p>
                            Te hemos enviado un correo para verificar tu email (por favor revisa tu bandeja de Spam). Una vez confirmado y aprobado por el equipo, podrás iniciar sesión.
                        </p>
                        
                        <div className="pt-4 space-y-2">
                            <Link href="/login" className="block">
                                <Button variant="outline" className="w-full">
                                    Verificar Estado
                                </Button>
                            </Link>
                            <form action={logout}>
                                <button
                                    type="submit"
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                                >
                                    Cerrar sesión
                                </button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
