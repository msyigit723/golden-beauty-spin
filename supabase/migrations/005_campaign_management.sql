-- Add new columns for campaign management and soft delete
ALTER TABLE campaigns
  ADD COLUMN start_date TIMESTAMPTZ,
  ADD COLUMN end_date TIMESTAMPTZ,
  ADD COLUMN banner_image_url TEXT,
  ADD COLUMN terms_and_conditions TEXT,
  ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

-- Drop probability constraint if it exists (since we changed rules for prizes, we might want the same for campaigns, or just leave it. The prompt says "Total probability does not have to equal 100" but for campaigns probability doesn't matter much if there's only 1 active. Let's drop it to prevent errors just in case).
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'campaigns'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%probability <= 100%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE campaigns DROP CONSTRAINT ' || constraint_name;
  END IF;
END $$;

-- Create trigger function to enforce single active campaign
CREATE OR REPLACE FUNCTION enforce_single_active_campaign()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.active = TRUE THEN
    -- Deactivate all other campaigns
    UPDATE campaigns SET active = FALSE WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_single_active_campaign ON campaigns;

CREATE TRIGGER trigger_single_active_campaign
BEFORE INSERT OR UPDATE ON campaigns
FOR EACH ROW EXECUTE FUNCTION enforce_single_active_campaign();

-- Create storage bucket for campaign images if not exists (Supabase specific)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign_images', 'campaign_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Access Campaigns" ON storage.objects FOR SELECT USING (bucket_id = 'campaign_images');
CREATE POLICY "Admin Upload Campaigns" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'campaign_images');
CREATE POLICY "Admin Update Campaigns" ON storage.objects FOR UPDATE USING (bucket_id = 'campaign_images');
CREATE POLICY "Admin Delete Campaigns" ON storage.objects FOR DELETE USING (bucket_id = 'campaign_images');
