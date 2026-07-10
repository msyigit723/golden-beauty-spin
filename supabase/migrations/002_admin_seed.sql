-- Seed a default admin user
-- Username: admin
-- Password: password123

INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2b$10$cUIklrZpmW3w7zoN09uJqevMNmNmR0DQrXoqYlhpyEC3fW8MkHLoO')
ON CONFLICT (username) DO NOTHING;
