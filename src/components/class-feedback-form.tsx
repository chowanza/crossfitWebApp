"use client";

import { useState } from "react";
import { submitClassFeedback } from "@/actions/feedback";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ClassFeedbackFormProps {
    wodId: string;
    existingRating?: number;
    existingComment?: string;
}

export function ClassFeedbackForm({
    wodId,
    existingRating,
    existingComment,
}: ClassFeedbackFormProps) {
    const [rating, setRating] = useState(existingRating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        setSuccess(false);

        formData.set("wod_id", wodId);
        formData.set("rating", rating.toString());

        const result = await submitClassFeedback(formData);
        if (result?.error) {
            setError(result.error);
            toast.error("Hubo un problema: " + result.error);
        } else {
            setSuccess(true);
            toast.success("¡Gracias por tu reseña! Tu opinión ha sido guardada.");
        }
        setLoading(false);
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>¿Cómo estuvo la clase?</Label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star
                                className={`w-7 h-7 transition-colors ${star <= (hoverRating || rating)
                                    ? "fill-yellow-500 text-yellow-500"
                                    : "text-muted-foreground/30"
                                    }`}
                            />
                        </button>
                    ))}
                    {rating > 0 && (
                        <span className="ml-2 text-sm text-muted-foreground self-center font-medium">
                            {rating}/5
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label>Comentario (opcional)</Label>
                <Textarea
                    name="comment"
                    defaultValue={existingComment}
                    placeholder="¿Qué te pareció? ¿Sugerencias?"
                    rows={2}
                    className="bg-muted/50 resize-none"
                />
            </div>

            {error && (
                <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> ¡Gracias por tu feedback!
                </div>
            )}

            <Button
                type="submit"
                isLoading={loading}
                disabled={rating === 0}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
            >
                {loading
                    ? "Enviando..."
                    : existingRating
                        ? "Actualizar Feedback"
                        : "Enviar Feedback"}
            </Button>
        </form>
    );
}
