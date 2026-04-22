-- ============================================================
-- Iron Fit Venezuela — Supabase Schema (Fase 6 - RLS Fix)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- Corrige el error: "new row violates row-level security policy for table wods"
-- al permitir que el rol 'SUPERADMIN' también pueda crear y editar rutinas.
-- ============================================================

-- 1. Políticas de la tabla WODS
-- ============================================================
DROP POLICY IF EXISTS "wods: admin crea" ON public.wods;
CREATE POLICY "wods: admin crea"
  ON public.wods FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERADMIN')
    )
  );

DROP POLICY IF EXISTS "wods: admin actualiza" ON public.wods;
CREATE POLICY "wods: admin actualiza"
  ON public.wods FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERADMIN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERADMIN')
    )
  );

DROP POLICY IF EXISTS "wods: admin elimina" ON public.wods;
CREATE POLICY "wods: admin elimina"
  ON public.wods FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERADMIN')
    )
  );


-- 2. Políticas de la tabla WOD_SECTIONS
-- ============================================================
DROP POLICY IF EXISTS "wod_sections: admin crea" ON public.wod_sections;
CREATE POLICY "wod_sections: admin crea"
  ON public.wod_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERADMIN')
    )
  );

DROP POLICY IF EXISTS "wod_sections: admin actualiza" ON public.wod_sections;
CREATE POLICY "wod_sections: admin actualiza"
  ON public.wod_sections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERADMIN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERADMIN')
    )
  );

DROP POLICY IF EXISTS "wod_sections: admin elimina" ON public.wod_sections;
CREATE POLICY "wod_sections: admin elimina"
  ON public.wod_sections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERADMIN')
    )
  );


-- 3. Políticas de la tabla WOD_SECTION_MOVEMENTS
-- ============================================================
DROP POLICY IF EXISTS "wod_section_movements: admin crea" ON public.wod_section_movements;
CREATE POLICY "wod_section_movements: admin crea"
  ON public.wod_section_movements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERADMIN')
    )
  );

DROP POLICY IF EXISTS "wod_section_movements: admin actualiza" ON public.wod_section_movements;
CREATE POLICY "wod_section_movements: admin actualiza"
  ON public.wod_section_movements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERADMIN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERADMIN')
    )
  );

DROP POLICY IF EXISTS "wod_section_movements: admin elimina" ON public.wod_section_movements;
CREATE POLICY "wod_section_movements: admin elimina"
  ON public.wod_section_movements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERADMIN')
    )
  );
