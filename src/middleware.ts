import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Rutas que no requieren autenticación.
const PUBLIC_ROUTES = ["/login", "/auth/callback"];

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

    // 4. Verificar estado de deuda para atletas (no admins).
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, last_payment_date")
        .eq("id", user.id)
        .single();

    if (profile && profile.role === "USER" && profile.last_payment_date) {
        const lastPayment = new Date(profile.last_payment_date);
        const now = new Date();
        const diffDays = Math.floor(
            (now.getTime() - lastPayment.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Bloqueo estricto: más de 3 días de morosidad.
        const isOverdue = diffDays > 3;
        const isPaymentPage = pathname.startsWith("/payment");

        if (isOverdue && !isPaymentPage) {
            const paymentUrl = request.nextUrl.clone();
            paymentUrl.pathname = "/payment";
            return NextResponse.redirect(paymentUrl);
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
