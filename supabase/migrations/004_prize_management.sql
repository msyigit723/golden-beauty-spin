-- Alter prizes table to add aesthetics and soft delete
ALTER TABLE prizes
  ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN display_order INTEGER DEFAULT 0,
  ADD COLUMN image_url TEXT,
  ADD COLUMN bg_color VARCHAR(20) DEFAULT '#FFFFFF',
  ADD COLUMN text_color VARCHAR(20) DEFAULT '#000000',
  ADD COLUMN icon VARCHAR(50);

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'prizes'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%probability <= 100%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE prizes DROP CONSTRAINT ' || constraint_name;
  END IF;
END $$;

-- Update index to include is_deleted
DROP INDEX IF EXISTS idx_prizes_active;
CREATE INDEX idx_prizes_active_deleted ON prizes(is_active, is_deleted);
CREATE INDEX idx_prizes_order ON prizes(display_order);

-- Create storage bucket for prize images if not exists (Supabase specific)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prize_images', 'prize_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'prize_images');
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'prize_images');
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'prize_images');
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'prize_images');
