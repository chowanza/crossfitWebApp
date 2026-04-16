-- Requerimiento Funcional 07: Pesos personalizados por atleta
-- Tabla para asignar un peso distinto al especificado en el WOD por defecto.

CREATE TABLE public.athlete_wod_weights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    section_movement_id UUID NOT NULL REFERENCES public.wod_section_movements(id) ON DELETE CASCADE,
    weight_kg NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indice para búsquedas rápidas al cargar los wods
CREATE INDEX idx_athlete_wod_weights_mov_ath ON public.athlete_wod_weights(section_movement_id, athlete_id);

-- Habilitar RLS
ALTER TABLE public.athlete_wod_weights ENABLE ROW LEVEL SECURITY;

-- Políticas
-- Todos (autenticados) pueden leer los pesos para saber quién hizo cuánto
CREATE POLICY "Todos pueden ver athlete_wod_weights"
ON public.athlete_wod_weights FOR SELECT
TO authenticated
USING (true);

-- Solo ADMIN y SUPERADMIN pueden asignar/modificar pesos
CREATE POLICY "Admins pueden gestionar athlete_wod_weights"
ON public.athlete_wod_weights FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('ADMIN', 'SUPERADMIN')
    )
);
