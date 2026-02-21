-- ============================================================
-- Iron Fit Venezuela — Supabase Schema (Fase 1)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. ENUMS
-- ============================================================
CREATE TYPE public.user_role AS ENUM ('ADMIN', 'USER');
CREATE TYPE public.wod_type  AS ENUM ('AMRAP', 'EMOM', 'FOR_TIME', 'TABATA', 'CUSTOM');

-- 2. TABLAS
-- ============================================================

-- profiles: se crea automáticamente al registrar un usuario en Auth.
CREATE TABLE public.profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role             public.user_role NOT NULL DEFAULT 'USER',
  full_name        TEXT NOT NULL DEFAULT '',
  avatar_url       TEXT,
  weight_kg        NUMERIC(5,2),
  height_cm        NUMERIC(5,2),
  last_payment_date DATE,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Perfil extendido de cada usuario. Enlazado 1:1 con auth.users.';

-- wods: rutinas diarias creadas por entrenadores.
CREATE TABLE public.wods (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  wod_type    public.wod_type NOT NULL DEFAULT 'CUSTOM',
  created_by  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.wods IS 'Workout of the Day — rutinas creadas por entrenadores.';

-- Índice para consultas frecuentes por fecha.
CREATE INDEX idx_wods_date ON public.wods(date DESC);

-- 3. TRIGGER: actualizar updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_wods_updated
  BEFORE UPDATE ON public.wods
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. TRIGGER: crear perfil automáticamente al registrar usuario
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- ---- profiles ----
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede ver todos los perfiles.
CREATE POLICY "profiles: lectura para autenticados"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Un usuario solo puede actualizar su propio perfil.
CREATE POLICY "profiles: usuario actualiza su perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Solo ADMIN puede insertar perfiles (registro de atletas).
CREATE POLICY "profiles: admin inserta"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Solo ADMIN puede eliminar perfiles.
CREATE POLICY "profiles: admin elimina"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ---- wods ----
ALTER TABLE public.wods ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede ver los WODs.
CREATE POLICY "wods: lectura para autenticados"
  ON public.wods FOR SELECT
  TO authenticated
  USING (true);

-- Solo ADMIN puede crear WODs.
CREATE POLICY "wods: admin crea"
  ON public.wods FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Solo ADMIN puede actualizar WODs.
CREATE POLICY "wods: admin actualiza"
  ON public.wods FOR UPDATE
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

-- Solo ADMIN puede eliminar WODs.
CREATE POLICY "wods: admin elimina"
  ON public.wods FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
