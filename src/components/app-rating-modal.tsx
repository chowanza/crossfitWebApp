"use client";

import { useState, useEffect } from "react";
import { submitAppRating } from "@/actions/ratings";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface AppRatingModalProps {
    hasRatedThisMonth: boolean;
    currentPeriod: string;
}

export function AppRatingModal({
    hasRatedThisMonth,
    currentPeriod,
}: AppRatingModalProps) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Mostrar modal solo si no ha calificado este mes.
        // Usar sessionStorage para no molestar más de 1 vez por sesión.
        if (!hasRatedThisMonth) {
            const key = `app-rating-dismissed-${currentPeriod}`;
            const dismissed = sessionStorage.getItem(key);
            if (!dismissed) {
                const timer = setTimeout(() => setOpen(true), 3000); // 3 segundos después de cargar
                return () => clearTimeout(timer);
            }
        }
    }, [hasRatedThisMonth, currentPeriod]);

    function handleClose() {
        setOpen(false);
        const key = `app-rating-dismissed-${currentPeriod}`;
        sessionStorage.setItem(key, "true");
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        formData.set("rating", rating.toString());
        formData.set("period", currentPeriod);

        const result = await submitAppRating(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            setTimeout(() => {
                setOpen(false);
            }, 1500);
        }
    }

    if (hasRatedThisMonth) return null;

    return (
        <Dialog open={open} onOpenChange={(v) => (!v ? handleClose() : setOpen(v))}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <DialogTitle className="text-xl">
                        ¿Cómo va tu experiencia? ⭐
                    </DialogTitle>
                    <DialogDescription>
                        Califica Iron Fit Venezuela este mes ({currentPeriod}). Tu opinión
                        nos ayuda a mejorar.
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-8 text-center">
                        <p className="text-4xl mb-3">🎉</p>
                        <p className="text-lg font-medium text-green-400">
                            ¡Gracias por tu calificación!
                        </p>
                    </div>
                ) : (
                    <form action={handleSubmit} className="space-y-6">
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="text-4xl transition-all hover:scale-125"
                                >
                                    {star <= (hoverRating || rating) ? "⭐" : "☆"}
                                </button>
                            ))}
                        </div>

                        {rating > 0 && (
                            <p className="text-center text-sm text-muted-foreground">
                                {rating === 5
                                    ? "¡Excelente! 🔥"
                                    : rating === 4
                                        ? "Muy bien 💪"
                                        : rating === 3
                                            ? "Puede mejorar 👍"
                                            : rating === 2
                                                ? "Regular 😐"
                                                : "Necesita mejorar 😟"}
                            </p>
                        )}

                        <Textarea
                            name="comment"
                            placeholder="¿Algo que quieras compartir? (opcional)"
                            rows={2}
                            className="bg-muted/50 resize-none"
                        />

                        {error && (
                            <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleClose}
                                className="text-muted-foreground"
                            >
                                Más tarde
                            </Button>
                            <Button
                                type="submit"
                                isLoading={loading}
                                disabled={rating === 0}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                            >
                                {loading ? "Enviando..." : "Enviar"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
