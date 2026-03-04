import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { WorkoutTracker } from "@/components/workout-tracker";

export default async function TrackerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: wodData } = await supabase
        .from("wods")
        .select(`
            *,
            wod_sections (
                *,
                wod_section_movements (
                    *,
                    movements (name, media_url)
                )
            )
        `)
        .eq("id", id)
        .single();

    if (!wodData) notFound();

    // Map WOD data to something the static tracker component can use
    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <WorkoutTracker wod={wodData as any} />
        </div>
    );
}
