-- Add delivery management columns to spins table
ALTER TABLE spins
  ADD COLUMN is_delivered BOOLEAN DEFAULT FALSE,
  ADD COLUMN delivery_note TEXT;

-- Create an index for delivery status filtering
CREATE INDEX idx_spins_delivery ON spins(is_delivered);
