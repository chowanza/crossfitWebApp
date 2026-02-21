// ============================================================
// Algoritmo de recomendación de pesos
// Basado en porcentajes del 1RM según tipo de WOD y duración
// ============================================================

import type { WodType } from "@/lib/types/database";

interface WeightRecommendation {
    percentage: number;
    suggestedWeight: number;
    label: string;
    description: string;
}

/**
 * Obtiene la recomendación de peso basada en el 1RM del atleta
 * y el tipo de WOD que va a realizar.
 *
 * Reglas generales de CrossFit:
 * - Strength (5x5, 3x3) → 75-85% del 1RM
 * - AMRAP (alta repetición) → 50-65% del 1RM
 * - EMOM → 60-70% del 1RM
 * - FOR TIME (competitivo) → 65-75% del 1RM
 * - TABATA → 40-50% del 1RM (volumen alto)
 */
export function getWeightRecommendation(
    oneRepMax: number,
    wodType: WodType
): WeightRecommendation {
    const configs: Record<WodType, { pct: number; label: string; desc: string }> = {
        CUSTOM: {
            pct: 0.75,
            label: "Strength",
            desc: "75% del 1RM — trabajo de fuerza moderado.",
        },
        AMRAP: {
            pct: 0.55,
            label: "AMRAP",
            desc: "55% del 1RM — alta repetición, mantén ritmo.",
        },
        EMOM: {
            pct: 0.65,
            label: "EMOM",
            desc: "65% del 1RM — velocidad controlada cada minuto.",
        },
        FOR_TIME: {
            pct: 0.7,
            label: "For Time",
            desc: "70% del 1RM — intensidad competitiva.",
        },
        TABATA: {
            pct: 0.45,
            label: "Tabata",
            desc: "45% del 1RM — alto volumen, intervalos cortos.",
        },
        STRENGTH: {
            pct: 0.85,
            label: "Fuerza",
            desc: "85% del 1RM — series cortas, peso elevado.",
        },
    };

    const config = configs[wodType];
    const suggested = Math.round(oneRepMax * config.pct * 2) / 2; // Redondear a 0.5

    return {
        percentage: config.pct * 100,
        suggestedWeight: suggested,
        label: config.label,
        description: config.desc,
    };
}

/**
 * Obtiene múltiples recomendaciones de pesos a diferentes
 * porcentajes para un movimiento dado.
 */
export function getWeightTable(oneRepMax: number): {
    pct: number;
    weight: number;
    label: string;
}[] {
    return [
        { pct: 50, weight: Math.round(oneRepMax * 0.5 * 2) / 2, label: "Calentamiento" },
        { pct: 60, weight: Math.round(oneRepMax * 0.6 * 2) / 2, label: "Ligero" },
        { pct: 70, weight: Math.round(oneRepMax * 0.7 * 2) / 2, label: "Moderado" },
        { pct: 75, weight: Math.round(oneRepMax * 0.75 * 2) / 2, label: "Moderado-Alto" },
        { pct: 80, weight: Math.round(oneRepMax * 0.8 * 2) / 2, label: "Pesado" },
        { pct: 85, weight: Math.round(oneRepMax * 0.85 * 2) / 2, label: "Muy Pesado" },
        { pct: 90, weight: Math.round(oneRepMax * 0.9 * 2) / 2, label: "Near Max" },
        { pct: 95, weight: Math.round(oneRepMax * 0.95 * 2) / 2, label: "Max Effort" },
    ];
}
