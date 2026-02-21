-- ============================================================
-- Iron Fit Venezuela — Supabase Schema (Fase 4)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- DESPUÉS de haber ejecutado schema.sql, schema-fase2.sql y schema-fase3.sql
-- ============================================================

-- 1. TABLAS
-- ============================================================

-- class_sessions: feedback de clases (rating + comentario por WOD).
CREATE TABLE public.class_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wod_id     UUID NOT NULL REFERENCES public.wods(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating     SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment    TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(wod_id, user_id)
);

COMMENT ON TABLE public.class_sessions IS 'Feedback de los atletas sobre cada clase/WOD.';

-- app_ratings: calificación mensual de la app.
CREATE TABLE public.app_ratings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating     SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  period     TEXT NOT NULL, -- formato YYYY-MM
  comment    TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, period)
);

COMMENT ON TABLE public.app_ratings IS 'Calificación mensual de la app por parte de los atletas.';

-- Índices
CREATE INDEX idx_class_sessions_wod ON public.class_sessions(wod_id);
CREATE INDEX idx_class_sessions_user ON public.class_sessions(user_id);
CREATE INDEX idx_app_ratings_period ON public.app_ratings(period);
CREATE INDEX idx_app_ratings_user ON public.app_ratings(user_id);

-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- ---- class_sessions ----
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;

-- Lectura: atleta ve las suyas, admin ve todas.
CREATE POLICY "class_sessions: lectura"
  ON public.class_sessions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Inserción: el atleta inserta su propio feedback.
CREATE POLICY "class_sessions: insertar"
  ON public.class_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update: el atleta actualiza su propio feedback.
CREATE POLICY "class_sessions: actualizar"
  ON public.class_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Delete: el atleta elimina su propio feedback.
CREATE POLICY "class_sessions: eliminar"
  ON public.class_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---- app_ratings ----
ALTER TABLE public.app_ratings ENABLE ROW LEVEL SECURITY;

-- Lectura: atleta ve las suyas, admin ve todas.
CREATE POLICY "app_ratings: lectura"
  ON public.app_ratings FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Inserción: el atleta inserta su rating (1 por mes, manejado por UNIQUE).
CREATE POLICY "app_ratings: insertar"
  ON public.app_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update: el atleta actualiza su rating del mes.
CREATE POLICY "app_ratings: actualizar"
  ON public.app_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
