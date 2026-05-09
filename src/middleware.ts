import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Rutas que no requieren autenticación.
const PUBLIC_ROUTES = ["/login", "/auth/callback", "/forgot-password", "/update-password", "/register", "/pending-approval"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Refrescar sesión de Supabase.
    const { user, supabase, supabaseResponse } = await updateSession(request);

    // 2. Si es ruta pública, dejar pasar.
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
        return supabaseResponse;
    }

    // 3. Si no hay sesión, redirigir a login.
    if (!user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        return NextResponse.redirect(loginUrl);
    }

    // 4. Verificar estado de cuenta y deuda para atletas.
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, last_payment_date, is_active")
        .eq("id", user.id)
        .single();

    if (profile) {
        // 4.1. Bloqueo por falta de activación del Admin (Email no confirmado/aprobado)
        if (profile.is_active !== true) {
            const pendingUrl = request.nextUrl.clone();
            pendingUrl.pathname = "/pending-approval";
            return NextResponse.redirect(pendingUrl);
        }

        // 4.2. Bloqueo por deuda para atletas
        if (profile.role === "USER") {
            const isPaymentPage = pathname.startsWith("/payment");

            // Solo bloqueamos si hay una fecha de vencimiento registrada.
            // Si last_payment_date es null, es un usuario nuevo activado manualmente
            // por el admin pero sin pagos aún registrados.
            if (profile.last_payment_date) {
                const expirationDate = new Date(profile.last_payment_date);
                const now = new Date();
                
                // Calculamos la diferencia en días
                const diffTime = now.getTime() - expirationDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                // Bloqueo estricto: más de 3 días de mora.
                if (diffDays > 3 && !isPaymentPage) {
                    const paymentUrl = request.nextUrl.clone();
                    paymentUrl.pathname = "/payment";
                    return NextResponse.redirect(paymentUrl);
                }
            }
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Coincide con todas las rutas excepto:
         * - _next/static (archivos estáticos)
         * - _next/image (optimización de imágenes)
         * - favicon.ico, sitemap.xml, robots.txt
         * - Archivos de assets públicos
         */
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
