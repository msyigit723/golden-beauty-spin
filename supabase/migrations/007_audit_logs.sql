-- Create audit_logs table for tracking admin actions
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID, -- Optional foreign key if we strictly link, but since we rely on token user id we'll leave it as simple text for now to avoid FK issues if admins are deleted
  admin_username VARCHAR(100),
  action_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(100),
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_action ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
