-- ============================================================
-- Iron Fit Venezuela — Supabase Storage Schema (Avatares)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Crear el bucket "avatars" de acceso público
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  false,
  5242880, -- Límite de 5MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
);

-- 2. Habilitar RLS en objetos de storage
-- (Supabase Storage objects table es storage.objects)

-- 3. Políticas de Acceso (Pueden requerir habilitar RLS manualmente en el dashboard si no lo está)
CREATE POLICY "Avatares son públicos para leer"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Usuarios pueden subir su propio avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Usuarios pueden actualizar su propio avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid() = owner
);

CREATE POLICY "Usuarios pueden eliminar su propio avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid() = owner
);
