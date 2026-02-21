-- ============================================================
-- Iron Fit Venezuela — WOD Refactor Migration
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
--
-- IMPORTANTE: Este script MODIFICA tablas existentes.
-- Si no tienes datos, puedes ejecutar directamente.
-- Si tienes datos, haz backup primero.
-- ============================================================

-- 1. NUEVO ENUM
-- ============================================================
CREATE TYPE public.section_type AS ENUM (
  'AMRAP', 'EMOM', 'FOR_TIME', 'TABATA', 'STRENGTH', 'CUSTOM'
);

-- 2. NUEVA TABLA: wod_sections (bloques dentro de un WOD)
-- ============================================================
CREATE TABLE public.wod_sections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wod_id           UUID NOT NULL REFERENCES public.wods(id) ON DELETE CASCADE,
  section_type     public.section_type NOT NULL DEFAULT 'CUSTOM',
  time_cap_seconds INT,
  description      TEXT DEFAULT '',
  order_index      INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.wod_sections IS 'Bloques/secciones dentro de un WOD (AMRAP, FOR TIME, etc.).';

CREATE INDEX idx_wod_sections_wod ON public.wod_sections(wod_id);

CREATE TRIGGER on_wod_sections_updated
  BEFORE UPDATE ON public.wod_sections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. NUEVA TABLA: wod_section_movements (movimientos en cada bloque)
-- ============================================================
CREATE TABLE public.wod_section_movements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id    UUID NOT NULL REFERENCES public.wod_sections(id) ON DELETE CASCADE,
  movement_id   UUID NOT NULL REFERENCES public.movements(id) ON DELETE CASCADE,
  reps          INT,
  weight_kg     NUMERIC(6,2),
  notes         TEXT DEFAULT '',
  order_index   INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.wod_section_movements IS 'Movimientos dentro de cada sección de un WOD.';

CREATE INDEX idx_section_movements_section ON public.wod_section_movements(section_id);

-- 4. MODIFICAR wod_results: referenciar section_id en vez de wod_id
-- ============================================================
-- Eliminar la columna wod_id y agregar section_id.
-- Si tienes datos existentes, necesitarás migrarlos.

ALTER TABLE public.wod_results DROP CONSTRAINT IF EXISTS wod_results_wod_id_fkey;
ALTER TABLE public.wod_results DROP COLUMN IF EXISTS wod_id;
ALTER TABLE public.wod_results ADD COLUMN section_id UUID REFERENCES public.wod_sections(id) ON DELETE CASCADE;

-- Hacer NOT NULL después de migración (si hay datos, migrar primero).
-- ALTER TABLE public.wod_results ALTER COLUMN section_id SET NOT NULL;

-- Eliminar constraint UNIQUE viejo si existe y agregar nuevo.
ALTER TABLE public.wod_results DROP CONSTRAINT IF EXISTS wod_results_wod_id_user_id_key;
ALTER TABLE public.wod_results ADD CONSTRAINT wod_results_section_user_unique UNIQUE(section_id, user_id);

CREATE INDEX idx_wod_results_section ON public.wod_results(section_id);

-- 5. MODIFICAR wods: renombrar description a notes, quitar wod_type
-- ============================================================
ALTER TABLE public.wods RENAME COLUMN description TO notes;
ALTER TABLE public.wods DROP COLUMN IF EXISTS wod_type;

-- 6. ROW LEVEL SECURITY
-- ============================================================

-- ---- wod_sections ----
ALTER TABLE public.wod_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wod_sections: lectura publica"
  ON public.wod_sections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "wod_sections: admin crea"
  ON public.wod_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "wod_sections: admin actualiza"
  ON public.wod_sections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "wod_sections: admin elimina"
  ON public.wod_sections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ---- wod_section_movements ----
ALTER TABLE public.wod_section_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wod_section_movements: lectura publica"
  ON public.wod_section_movements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "wod_section_movements: admin crea"
  ON public.wod_section_movements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "wod_section_movements: admin actualiza"
  ON public.wod_section_movements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "wod_section_movements: admin elimina"
  ON public.wod_section_movements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
