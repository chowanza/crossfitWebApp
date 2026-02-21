-- ============================================================
-- Iron Fit Venezuela — Supabase Schema (Fase 3)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- DESPUÉS de haber ejecutado schema.sql y schema-fase2.sql
-- ============================================================

-- 1. ENUMS
-- ============================================================
CREATE TYPE public.payment_status AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE public.notification_type AS ENUM ('PAYMENT', 'WOD', 'PR', 'SYSTEM', 'REMINDER');

-- 2. TABLAS
-- ============================================================

-- payments: registro de pagos de mensualidad.
CREATE TABLE public.payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount         NUMERIC(10,2) NOT NULL,
  payment_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  period_start   DATE NOT NULL,
  period_end     DATE NOT NULL,
  status         public.payment_status NOT NULL DEFAULT 'PENDING',
  notes          TEXT DEFAULT '',
  registered_by  UUID REFERENCES public.profiles(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.payments IS 'Registro de pagos de mensualidad de los atletas.';

-- notifications: notificaciones in-app.
CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL DEFAULT '',
  type       public.notification_type NOT NULL DEFAULT 'SYSTEM',
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  link       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notifications IS 'Notificaciones in-app para los usuarios.';

-- Índices
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_period ON public.payments(period_end DESC);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

-- 3. TRIGGERS
-- ============================================================
CREATE TRIGGER on_payments_updated
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. TRIGGER: actualizar last_payment_date al registrar pago PAID
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_payment_registered()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'PAID' THEN
    UPDATE public.profiles
    SET last_payment_date = NEW.payment_date
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_payment_registered
  AFTER INSERT OR UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_payment_registered();

-- 5. TRIGGER: notificación automática al registrar pago
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_payment_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'PAID' THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      'Pago registrado',
      'Tu pago de ' || NEW.amount || ' ha sido registrado para el período ' || NEW.period_start || ' a ' || NEW.period_end || '.',
      'PAYMENT',
      '/profile'
    );
  ELSIF NEW.status = 'OVERDUE' THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      'Pago vencido',
      'Tu mensualidad del período ' || NEW.period_start || ' a ' || NEW.period_end || ' está vencida. Comunícate con tu entrenador.',
      'PAYMENT',
      '/payment'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_payment_notification
  AFTER INSERT OR UPDATE OF status ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_payment_notification();

-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- ---- payments ----
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Atleta ve solo sus propios pagos.
CREATE POLICY "payments: usuario ve sus pagos"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Solo ADMIN puede registrar pagos.
CREATE POLICY "payments: admin registra"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Solo ADMIN puede actualizar pagos.
CREATE POLICY "payments: admin actualiza"
  ON public.payments FOR UPDATE
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

-- Solo ADMIN puede eliminar pagos.
CREATE POLICY "payments: admin elimina"
  ON public.payments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ---- notifications ----
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Usuario ve solo sus propias notificaciones.
CREATE POLICY "notifications: usuario ve las suyas"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Usuario puede marcar como leída (update is_read).
CREATE POLICY "notifications: usuario actualiza"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ADMIN o triggers pueden insertar notificaciones.
CREATE POLICY "notifications: admin inserta"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Usuario puede eliminar sus notificaciones.
CREATE POLICY "notifications: usuario elimina"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
