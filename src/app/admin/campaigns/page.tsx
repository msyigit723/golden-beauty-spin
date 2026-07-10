"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  probability: number;
  display_order: number;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  banner_image_url: string | null;
  terms_and_conditions: string | null;
};

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSave = async (campaign: Campaign) => {
    try {
      const method = campaign.id ? 'PUT' : 'POST';
      const url = campaign.id ? `/api/admin/campaigns/${campaign.id}` : '/api/admin/campaigns';
      
      // Send null instead of empty string for dates
      const payload = { ...campaign };
      if (!payload.start_date) payload.start_date = null;
      if (!payload.end_date) payload.end_date = null;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setEditingCampaign(null);
        fetchCampaigns();
      } else {
        const data = await res.json();
        alert(data.error || 'Bir hata oluştu.');
      }
    } catch (e) {
      alert('Sistem hatası.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Emin misiniz? Kampanya geçmişi korunacak fakat sistemden kalkacaktır.')) return;
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCampaigns();
      }
    } catch (e) {
      alert('Silinemedi.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !editingCampaign) return;
    const file = e.target.files[0];
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `banners/${fileName}`;

    try {
      setIsLoading(true);
      const { error: uploadError } = await supabase.storage
        .from('campaign_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('campaign_images').getPublicUrl(filePath);
      
      setEditingCampaign({ ...editingCampaign, banner_image_url: data.publicUrl });
    } catch (error) {
      alert('Görsel yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const openNew = () => {
    setEditingCampaign({
      id: '',
      title: '',
      description: '',
      probability: 0,
      display_order: campaigns.length,
      active: false,
      start_date: '',
      end_date: '',
      banner_image_url: '',
      terms_and_conditions: '',
    });
  };

  if (isLoading && campaigns.length === 0 && !editingCampaign) return <div className="p-8 text-center">Yükleniyor...</div>;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif font-bold">Kampanya Yönetimi</h1>
        <Button onClick={openNew}>Yeni Kampanya</Button>
      </div>

      <div className="grid gap-4">
        {campaigns.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
              <div className="flex items-center gap-4">
                {c.banner_image_url ? (
                  <img src={c.banner_image_url} alt="banner" className="w-16 h-16 object-cover rounded shadow-sm" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">Görsel Yok</div>
                )}
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {c.title} 
                    {c.active ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Aktif</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Pasif</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{c.description || 'Açıklama yok'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Başlangıç: {c.start_date ? new Date(c.start_date).toLocaleString('tr-TR') : 'Belirtilmedi'} | 
                    Bitiş: {c.end_date ? new Date(c.end_date).toLocaleString('tr-TR') : 'Belirtilmedi'}
                  </p>
                </div>
              </div>
              <div className="space-x-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => setEditingCampaign(c)}>Düzenle</Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(c.id)}>Sil</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {campaigns.length === 0 && <p className="text-gray-500">Kayıtlı kampanya bulunamadı.</p>}
      </div>

      {editingCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingCampaign.id ? 'Kampanyayı Düzenle' : 'Yeni Kampanya'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                label="Başlık" 
                value={editingCampaign.title} 
                onChange={e => setEditingCampaign({...editingCampaign, title: e.target.value})} 
              />
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Açıklama</label>
                <textarea 
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-luxury-gold outline-none"
                  rows={2}
                  value={editingCampaign.description || ''}
                  onChange={e => setEditingCampaign({...editingCampaign, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Başlangıç Tarihi" 
                  type="datetime-local" 
                  value={editingCampaign.start_date ? new Date(editingCampaign.start_date).toISOString().slice(0, 16) : ''} 
                  onChange={e => setEditingCampaign({...editingCampaign, start_date: e.target.value})} 
                />
                <Input 
                  label="Bitiş Tarihi" 
                  type="datetime-local" 
                  value={editingCampaign.end_date ? new Date(editingCampaign.end_date).toISOString().slice(0, 16) : ''} 
                  onChange={e => setEditingCampaign({...editingCampaign, end_date: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Sıra (0, 1, 2...)" 
                  type="number" 
                  value={editingCampaign.display_order} 
                  onChange={e => setEditingCampaign({...editingCampaign, display_order: parseInt(e.target.value)})} 
                />
                <label className="flex items-center gap-2 mt-8 cursor-pointer bg-gray-50 p-2 rounded border">
                  <input 
                    type="checkbox" 
                    checked={editingCampaign.active}
                    onChange={e => setEditingCampaign({...editingCampaign, active: e.target.checked})} 
                    className="w-4 h-4 accent-luxury-gold"
                  />
                  <span className="text-sm font-medium text-gray-700">Aktif Yap (Diğerlerini deaktive eder)</span>
                </label>
              </div>
              
              <div className="border-t pt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Banner Görseli Yükle (Opsiyonel)</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="text-sm"
                      disabled={isLoading}
                    />
                    {editingCampaign.banner_image_url && (
                      <img src={editingCampaign.banner_image_url} alt="preview" className="h-10 w-20 object-cover rounded" />
                    )}
                  </div>
                </div>
                <Input 
                  label="Veya Manuel Banner URL" 
                  value={editingCampaign.banner_image_url || ''} 
                  onChange={e => setEditingCampaign({...editingCampaign, banner_image_url: e.target.value})} 
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-sm font-medium">Şartlar ve Koşullar</label>
                <textarea 
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-luxury-gold outline-none"
                  rows={4}
                  value={editingCampaign.terms_and_conditions || ''}
                  onChange={e => setEditingCampaign({...editingCampaign, terms_and_conditions: e.target.value})}
                  placeholder="Kampanya katılım kuralları vb."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setEditingCampaign(null)}>İptal</Button>
                <Button onClick={() => handleSave(editingCampaign)}>Kaydet</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
