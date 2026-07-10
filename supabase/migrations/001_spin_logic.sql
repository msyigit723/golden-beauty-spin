-- Prizes table
CREATE TABLE prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  probability DECIMAL(5,2) NOT NULL CHECK (probability >= 0 AND probability <= 100),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prizes_campaign ON prizes(campaign_id);
CREATE INDEX idx_prizes_active ON prizes(is_active);

-- Spins table (Single source of truth for spins)
CREATE TABLE spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  prize_id UUID NOT NULL REFERENCES prizes(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- Enforce one spin per user lifetime
);

CREATE INDEX idx_spins_user ON spins(user_id);

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
