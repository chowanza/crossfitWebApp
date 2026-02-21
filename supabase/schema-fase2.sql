-- ============================================================
-- Iron Fit Venezuela — Supabase Schema (Fase 2)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- DESPUÉS de haber ejecutado schema.sql (Fase 1)
-- ============================================================

-- 1. ENUM adicional
-- ============================================================
CREATE TYPE public.score_type AS ENUM ('TIME', 'REPS', 'ROUNDS', 'WEIGHT', 'CALORIES', 'POINTS');
CREATE TYPE public.movement_category AS ENUM ('WEIGHTLIFTING', 'GYMNASTICS', 'CARDIO', 'OTHER');

-- 2. TABLAS
-- ============================================================

-- movements: movimientos básicos de CrossFit.
CREATE TABLE public.movements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  category    public.movement_category NOT NULL DEFAULT 'OTHER',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.movements IS 'Catálogo de movimientos básicos de CrossFit.';

-- wod_results: resultados/scores de los atletas en cada WOD.
CREATE TABLE public.wod_results (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wod_id      UUID NOT NULL REFERENCES public.wods(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score_value TEXT NOT NULL,
  score_type  public.score_type NOT NULL DEFAULT 'TIME',
  rx          BOOLEAN NOT NULL DEFAULT FALSE,
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(wod_id, user_id)
);

COMMENT ON TABLE public.wod_results IS 'Resultados de los atletas en cada WOD. Un atleta puede tener un solo resultado por WOD.';

-- personal_records: pesos máximos por movimiento.
CREATE TABLE public.personal_records (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  movement_id  UUID NOT NULL REFERENCES public.movements(id) ON DELETE CASCADE,
  weight_value NUMERIC(6,2) NOT NULL,
  reps         INTEGER NOT NULL DEFAULT 1,
  notes        TEXT DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.personal_records IS 'Personal Records — pesos máximos por movimiento para cada atleta.';

-- Índices
CREATE INDEX idx_wod_results_wod ON public.wod_results(wod_id);
CREATE INDEX idx_wod_results_user ON public.wod_results(user_id);
CREATE INDEX idx_personal_records_user ON public.personal_records(user_id);
CREATE INDEX idx_personal_records_movement ON public.personal_records(movement_id);

-- 3. TRIGGERS: updated_at
-- ============================================================
CREATE TRIGGER on_movements_updated
  BEFORE UPDATE ON public.movements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_wod_results_updated
  BEFORE UPDATE ON public.wod_results
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_personal_records_updated
  BEFORE UPDATE ON public.personal_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- ---- movements ----
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "movements: lectura para autenticados"
  ON public.movements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "movements: admin crea"
  ON public.movements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "movements: admin actualiza"
  ON public.movements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "movements: admin elimina"
  ON public.movements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ---- wod_results ----
ALTER TABLE public.wod_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wod_results: lectura para autenticados"
  ON public.wod_results FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "wod_results: usuario registra su resultado"
  ON public.wod_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wod_results: usuario actualiza su resultado"
  ON public.wod_results FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wod_results: admin o dueño elimina"
  ON public.wod_results FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ---- personal_records ----
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "personal_records: lectura para autenticados"
  ON public.personal_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "personal_records: usuario registra su PR"
  ON public.personal_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "personal_records: usuario actualiza su PR"
  ON public.personal_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "personal_records: usuario elimina su PR"
  ON public.personal_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. SEED: movimientos básicos de CrossFit
-- ============================================================
INSERT INTO public.movements (name, description, category) VALUES
  ('Back Squat', 'Sentadilla trasera con barra', 'WEIGHTLIFTING'),
  ('Front Squat', 'Sentadilla frontal con barra', 'WEIGHTLIFTING'),
  ('Deadlift', 'Peso muerto convencional', 'WEIGHTLIFTING'),
  ('Clean', 'Cargada desde el piso', 'WEIGHTLIFTING'),
  ('Clean & Jerk', 'Cargada y envión', 'WEIGHTLIFTING'),
  ('Snatch', 'Arranque olímpico', 'WEIGHTLIFTING'),
  ('Overhead Press', 'Press de hombros con barra', 'WEIGHTLIFTING'),
  ('Push Press', 'Push press con barra', 'WEIGHTLIFTING'),
  ('Thruster', 'Front squat + push press', 'WEIGHTLIFTING'),
  ('Power Clean', 'Cargada de potencia', 'WEIGHTLIFTING'),
  ('Bench Press', 'Press de banca', 'WEIGHTLIFTING'),
  ('Pull-Up', 'Dominada estricta', 'GYMNASTICS'),
  ('Kipping Pull-Up', 'Dominada con kipping', 'GYMNASTICS'),
  ('Muscle-Up', 'Muscle-up en anillas o barra', 'GYMNASTICS'),
  ('Handstand Push-Up', 'Flexión invertida', 'GYMNASTICS'),
  ('Toes to Bar', 'Pies a la barra', 'GYMNASTICS'),
  ('Pistol Squat', 'Sentadilla a una pierna', 'GYMNASTICS'),
  ('Double Under', 'Doble giro de cuerda', 'GYMNASTICS'),
  ('Box Jump', 'Salto al cajón', 'GYMNASTICS'),
  ('Row (Calories)', 'Remo en ergómetro', 'CARDIO'),
  ('Bike (Calories)', 'Assault bike', 'CARDIO'),
  ('Run (400m)', 'Carrera de 400 metros', 'CARDIO'),
  ('Wall Ball', 'Lanzamiento de pelota a la pared', 'OTHER'),
  ('Kettlebell Swing', 'Swing de kettlebell', 'OTHER'),
  ('Burpee', 'Burpee estándar', 'OTHER')
ON CONFLICT (name) DO NOTHING;
