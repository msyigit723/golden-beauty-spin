import { UserCreatePayload, UserLoginPayload } from '@/types/user';

export const authService = {
  login: async (data: UserLoginPayload) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Giriş yapılamadı.');
    return json;
  },
  
  register: async (data: UserCreatePayload) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Kayıt olunamadı.');
    return json;
  },
  
  logout: async () => {
    const res = await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Çıkış yapılamadı.');
    return res.json();
  },
  
  getCurrentUser: async () => {
    const res = await fetch('/api/auth/me', { 
      method: 'GET',
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Oturum bilgisi alınamadı.');
    return json.user;
  },
};
