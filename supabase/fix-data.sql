-- ============================================================
-- FIX: Confirmación masiva de emails y sincronización de fechas de pago
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Confirmar emails de usuarios específicos que están teniendo problemas
UPDATE auth.users 
SET email_confirmed_at = now(), 
    last_sign_in_at = now() 
WHERE email IN ('test@gmail.com', 'test12345@gmail.com');

-- 2. Sincronizar last_payment_date de perfiles con su último pago registrado como PAID
-- Esto arregla a los atletas que "están activos" pero tienen fechas viejas
UPDATE public.profiles p
SET last_payment_date = (
  SELECT max(period_end)
  FROM public.payments pay
  WHERE pay.user_id = p.id AND pay.status = 'PAID'
)
WHERE EXISTS (
  SELECT 1 
  FROM public.payments pay 
  WHERE pay.user_id = p.id AND pay.status = 'PAID'
);

-- 3. (Opcional) Si quieres que un usuario específico entre YA sin importar su historial de pagos:
-- UPDATE public.profiles SET last_payment_date = '2026-12-31' WHERE full_name = 'TEST';
