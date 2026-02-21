-- ==========================================
-- Fase 6: Support for Movement Media
-- ==========================================

-- Add media_url to movements
ALTER TABLE movements ADD COLUMN IF NOT EXISTS media_url TEXT;

-- We don't need additional constraints for now, just a nullable text column.
-- It will be validated by the application or just stored as text (URL).
