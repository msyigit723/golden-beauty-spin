-- Update admin credentials
-- Username: 250291020
-- Password: 622Sefay.

UPDATE admins 
SET 
  username = '250291020', 
  password_hash = '$2b$10$gbYxtdOnyhScmnFpWZiYCub69t0kZWIIr9Mvx.9Zk04F93Duww3xW' 
WHERE username = 'admin';

-- If it didn't exist yet, insert it
INSERT INTO admins (username, password_hash)
SELECT '250291020', '$2b$10$gbYxtdOnyhScmnFpWZiYCub69t0kZWIIr9Mvx.9Zk04F93Duww3xW'
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE username = '250291020');
