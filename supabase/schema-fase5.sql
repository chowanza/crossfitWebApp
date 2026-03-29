-- ============================================================
-- Iron Fit Venezuela — Schema Fase 5: Campos de identidad
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- DESPUÉS de haber ejecutado los schemas anteriores
-- ============================================================

-- 1. Agregar columnas a la tabla profiles
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS cedula      VARCHAR(12)  UNIQUE,
    ADD COLUMN IF NOT EXISTS phone       VARCHAR(20),
    ADD COLUMN IF NOT EXISTS birth_date  DATE;

-- 2. Comentarios descriptivos
COMMENT ON COLUMN public.profiles.cedula     IS 'Cédula de identidad venezolana (ej: V-12345678)';
COMMENT ON COLUMN public.profiles.phone      IS 'Número de teléfono / WhatsApp del atleta';
COMMENT ON COLUMN public.profiles.birth_date IS 'Fecha de nacimiento del atleta';

-- 3. Índice para búsqueda rápida por cédula
CREATE INDEX IF NOT EXISTS idx_profiles_cedula ON public.profiles(cedula);
