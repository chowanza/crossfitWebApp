-- ============================================================
-- FIX: Corrección del trigger de pagos
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_payment_registered()
RETURNS TRIGGER AS $$
BEGIN
  -- Ahora usamos period_end para que last_payment_date sea el fin de la membresía
  IF NEW.status = 'PAID' THEN
    UPDATE public.profiles
    SET last_payment_date = NEW.period_end,
        is_active = true
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nota: No es necesario recrear el trigger, ya que CREATE OR REPLACE FUNCTION
-- actualiza la función que el trigger ya está llamando.
