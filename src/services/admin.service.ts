// Service Placeholder: admin.service.ts
export const adminService = {
  login: async (data: any) => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Giriş başarısız.');
    return json;
  },
  logout: async () => {
    const res = await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Çıkış yapılamadı.');
    return res.json();
  },
  getCampaigns: async () => {},
  getUsers: async () => {},
  getWinners: async () => {},
};
