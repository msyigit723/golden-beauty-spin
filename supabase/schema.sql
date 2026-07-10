-- ================================================
-- Golden Beauty Spin — Database Schema
-- ================================================

-- Users table
-- No has_spun column: spin status derived from spin_results
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns table
-- display_order controls wheel segment positioning
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  probability DECIMAL(10,2) NOT NULL CHECK (probability >= 0),
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  banner_image_url TEXT,
  terms_and_conditions TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_active ON campaigns(active, display_order);

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

CREATE TRIGGER trigger_single_active_campaign
BEFORE INSERT OR UPDATE ON campaigns
FOR EACH ROW EXECUTE FUNCTION enforce_single_active_campaign();

-- Prizes table
CREATE TABLE prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  probability DECIMAL(10,2) NOT NULL CHECK (probability >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  image_url TEXT,
  bg_color VARCHAR(20) DEFAULT '#FFFFFF',
  text_color VARCHAR(20) DEFAULT '#000000',
  icon VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prizes_campaign ON prizes(campaign_id);
CREATE INDEX idx_prizes_active_deleted ON prizes(is_active, is_deleted);
CREATE INDEX idx_prizes_order ON prizes(display_order);

-- Spins table (Single source of truth for spins)
CREATE TABLE spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL UNIQUE,
  campaign_id UUID REFERENCES campaigns(id) NOT NULL,
  prize_id UUID REFERENCES prizes(id) NOT NULL,
  is_delivered BOOLEAN DEFAULT FALSE,
  delivery_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_spins_user_id ON spins(user_id);
CREATE INDEX idx_spins_campaign_id ON spins(campaign_id);
CREATE INDEX idx_spins_delivery ON spins(is_delivered);

-- Create RPC for atomic spin claim
CREATE OR REPLACE FUNCTION claim_prize(p_user_id UUID, p_campaign_id UUID, p_prize_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stock INT;
BEGIN
  -- Check if already spun
  IF EXISTS (SELECT 1 FROM spins WHERE user_id = p_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'already_spun');
  END IF;

  -- Lock the prize row for update to prevent concurrent stock depletion
  SELECT stock INTO v_stock 
  FROM prizes 
  WHERE id = p_prize_id AND is_active = TRUE 
  FOR UPDATE;

  IF v_stock IS NULL OR v_stock <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'out_of_stock');
  END IF;

  -- Decrease stock
  UPDATE prizes SET stock = stock - 1 WHERE id = p_prize_id;

  -- Record the spin
  INSERT INTO spins (user_id, campaign_id, prize_id) 
  VALUES (p_user_id, p_campaign_id, p_prize_id);

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID,
  admin_username VARCHAR(100),
  action_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(100),
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_action ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
