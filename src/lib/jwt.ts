import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only_change_in_prod';

export interface UserTokenPayload {
  userId: string;
  role: 'user';
  iat?: number;
  exp?: number;
}

export interface AdminTokenPayload {
  adminId: string;
  role: 'admin';
  iat?: number;
  exp?: number;
}

export function signUserToken(userId: string): string {
  const payload = { userId, role: 'user' };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });
}

export function verifyUserToken(token: string): UserTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserTokenPayload;
    if (decoded.role !== 'user') return null;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function signAdminToken(adminId: string): string {
  const payload = { adminId, role: 'admin' };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: (process.env.ADMIN_JWT_EXPIRES_IN || '8h') as any,
  });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    if (decoded.role !== 'admin') return null;
    return decoded;
  } catch (error) {
    return null;
  }
}
