import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile, AppRating } from "@/lib/types/database";
import { RatingsDashboard } from "./ratings-dashboard";

interface RatingWithProfile extends AppRating {
    profiles: Pick<Profile, "full_name"> | null;
}

export default async function AdminRatingsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user!.id)
        .single();

    const profile = profileData as Pick<Profile, "role"> | null;
    if (profile?.role !== "ADMIN" && profile?.role !== "SUPERADMIN") redirect("/");

    // Todos los ratings
    const { data: ratingsData } = await supabase
        .from("app_ratings")
        .select("*, profiles(full_name)")
        .order("period", { ascending: false })
        .order("created_at", { ascending: false });

    const ratings = (ratingsData || []) as RatingWithProfile[];

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold">Satisfacción de la App</h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Calificaciones mensuales de los atletas.
                </p>
            </div>

            <RatingsDashboard initialRatings={ratings} />
        </div>
    );
}
