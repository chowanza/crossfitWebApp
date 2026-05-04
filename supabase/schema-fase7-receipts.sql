-- ============================================================
-- Iron Fit Venezuela — Supabase Schema (Fase 7 - Receipts)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Alterar tabla payments
ALTER TABLE public.payments
ADD COLUMN receipt_url TEXT;

COMMENT ON COLUMN public.payments.receipt_url IS 'URL del comprobante de pago subido al bucket receipts';

-- 2. Crear bucket de storage para los comprobantes si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de Storage para receipts
-- Atletas pueden subir comprobantes
CREATE POLICY "Atletas pueden subir sus comprobantes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts');

-- Admin y Superadmin pueden ver comprobantes
CREATE POLICY "Admins pueden ver comprobantes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' AND 
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'SUPERADMIN')
  )
);

-- Atletas pueden ver sus propios comprobantes (si el path incluye su ID, por ejemplo)
CREATE POLICY "Atletas pueden ver sus comprobantes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
