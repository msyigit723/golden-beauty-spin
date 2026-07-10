"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

// Quick types for the UI
type Prize = {
  id: string;
  title: string;
  probability: number;
  stock: number;
  is_active: boolean;
  display_order: number;
  bg_color: string;
  text_color: string;
  icon: string | null;
  image_url: string | null;
  campaign_id: string; // added campaign_id
};

type Campaign = {
  id: string;
  title: string;
};

export default function AdminPrizesPage() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [draggedPrizeId, setDraggedPrizeId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resPrizes, resCampaigns] = await Promise.all([
        fetch('/api/admin/prizes'),
        fetch('/api/admin/campaigns')
      ]);
      if (resPrizes.ok) setPrizes(await resPrizes.json());
      if (resCampaigns.ok) setCampaigns(await resCampaigns.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (prize: Prize) => {
    try {
      const method = prize.id ? 'PUT' : 'POST';
      const url = prize.id ? `/api/admin/prizes/${prize.id}` : '/api/admin/prizes';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prize)
      });
      
      if (res.ok) {
        setEditingPrize(null);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Bir hata oluştu.');
      }
    } catch (e) {
      alert('Sistem hatası.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Emin misiniz? Ödül geçmişi korunacak fakat çarktan kalkacaktır.')) return;
    try {
      const res = await fetch(`/api/admin/prizes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      alert('Silinemedi.');
    }
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedPrizeId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetPrizeId: string) => {
    e.preventDefault();
    if (!draggedPrizeId || draggedPrizeId === targetPrizeId) return;

    const newPrizes = [...prizes];
    const draggedIndex = newPrizes.findIndex(p => p.id === draggedPrizeId);
    const targetIndex = newPrizes.findIndex(p => p.id === targetPrizeId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder array
    const [draggedItem] = newPrizes.splice(draggedIndex, 1);
    newPrizes.splice(targetIndex, 0, draggedItem);

    // Update display_order sequentially
    const updatedPrizes = newPrizes.map((p, index) => ({
      ...p,
      display_order: index
    }));

    setPrizes(updatedPrizes);
    setDraggedPrizeId(null);

    // Save to API
    try {
      await fetch('/api/admin/prizes/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prizes: updatedPrizes.map(p => ({ id: p.id, display_order: p.display_order })) })
      });
    } catch (err) {
      alert('Sıralama kaydedilemedi.');
    }
  };

  const openNew = () => {
    setEditingPrize({
      id: '',
      title: '',
      probability: 0,
      stock: 0,
      is_active: true,
      display_order: prizes.length,
      bg_color: '#FFFFFF',
      text_color: '#000000',
      icon: null,
      image_url: null,
      campaign_id: campaigns.length > 0 ? campaigns[0].id : '',
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !editingPrize) return;
    const file = e.target.files[0];
    
    // Quick random filename to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `prizes/${fileName}`;

    try {
      setIsLoading(true);
      const { error: uploadError } = await supabase.storage
        .from('prize_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('prize_images').getPublicUrl(filePath);
      
      setEditingPrize({ ...editingPrize, image_url: data.publicUrl });
    } catch (error) {
      alert('Görsel yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && prizes.length === 0 && !editingPrize) return <div className="p-8 text-center">Yükleniyor...</div>;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif font-bold">Ödül Yönetimi</h1>
        <Button onClick={openNew}>Yeni Ödül Ekle</Button>
      </div>

      <div className="grid gap-4">
        {prizes.map((p) => (
          <div
            key={p.id}
            draggable
            onDragStart={(e) => handleDragStart(e, p.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, p.id)}
            className={`transition-opacity ${draggedPrizeId === p.id ? 'opacity-50' : ''}`}
          >
            <Card className="cursor-move border-dashed hover:border-luxury-gold/50 transition-colors">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full border shadow-sm flex items-center justify-center font-bold"
                    style={{ backgroundColor: p.bg_color, color: p.text_color }}
                  >
                    {p.image_url ? <img src={p.image_url} alt="prize" className="w-8 h-8 rounded-full" /> : (p.title[0] || '?')}
                  </div>
                  <div>
                    <h3 className="font-bold">{p.title} {p.is_active ? '' : '(Pasif)'}</h3>
                    <p className="text-sm text-gray-500">
                      Stok: {p.stock} | Olasılık: {p.probability} | Sıra: {p.display_order} 
                      {campaigns.find(c => c.id === p.campaign_id) ? ` | Kampanya: ${campaigns.find(c => c.id === p.campaign_id)?.title}` : ''}
                    </p>
                  </div>
                </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => setEditingPrize(p)}>Düzenle</Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(p.id)}>Sil</Button>
              </div>
            </CardContent>
          </Card>
          </div>
        ))}
        {prizes.length === 0 && <p className="text-gray-500">Kayıtlı ödül bulunamadı.</p>}
      </div>

      {/* Basic Editor Modal */}
      {editingPrize && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingPrize.id ? 'Ödülü Düzenle' : 'Yeni Ödül'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Kampanya Seçimi</label>
                <select 
                  className="w-full border rounded-lg p-2 h-10 focus:ring-2 focus:ring-luxury-gold outline-none"
                  value={editingPrize.campaign_id || ''}
                  onChange={e => setEditingPrize({...editingPrize, campaign_id: e.target.value})}
                >
                  <option value="" disabled>-- Kampanya Seçin --</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <Input 
                label="Başlık" 
                value={editingPrize.title} 
                onChange={e => setEditingPrize({...editingPrize, title: e.target.value})} 
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Olasılık (Örn: 10.5)" 
                  type="number" 
                  value={editingPrize.probability} 
                  onChange={e => setEditingPrize({...editingPrize, probability: parseFloat(e.target.value)})} 
                />
                <Input 
                  label="Stok" 
                  type="number" 
                  value={editingPrize.stock} 
                  onChange={e => setEditingPrize({...editingPrize, stock: parseInt(e.target.value)})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Sıra (0, 1, 2...)" 
                  type="number" 
                  value={editingPrize.display_order} 
                  onChange={e => setEditingPrize({...editingPrize, display_order: parseInt(e.target.value)})} 
                />
                <label className="flex items-center gap-2 mt-8 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingPrize.is_active}
                    onChange={e => setEditingPrize({...editingPrize, is_active: e.target.checked})} 
                    className="w-4 h-4 accent-luxury-gold"
                  />
                  <span>Aktif (Çarkta Görünür)</span>
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Arkaplan Rengi</label>
                  <div className="flex gap-2">
                    <input type="color" value={editingPrize.bg_color} onChange={e => setEditingPrize({...editingPrize, bg_color: e.target.value})} className="h-10 w-10 p-1 border rounded" />
                    <Input className="flex-1" value={editingPrize.bg_color} onChange={e => setEditingPrize({...editingPrize, bg_color: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Yazı Rengi</label>
                  <div className="flex gap-2">
                    <input type="color" value={editingPrize.text_color} onChange={e => setEditingPrize({...editingPrize, text_color: e.target.value})} className="h-10 w-10 p-1 border rounded" />
                    <Input className="flex-1" value={editingPrize.text_color} onChange={e => setEditingPrize({...editingPrize, text_color: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Görsel Yükle (Opsiyonel)</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="text-sm"
                      disabled={isLoading}
                    />
                    {editingPrize.image_url && (
                      <img src={editingPrize.image_url} alt="preview" className="h-10 w-10 object-cover rounded" />
                    )}
                  </div>
                </div>
                <Input 
                  label="Veya Manuel Görsel URL" 
                  value={editingPrize.image_url || ''} 
                  onChange={e => setEditingPrize({...editingPrize, image_url: e.target.value})} 
                  placeholder="https://..."
                />
                <Input 
                  label="İkon Adı (Opsiyonel Lucide vb.)" 
                  value={editingPrize.icon || ''} 
                  onChange={e => setEditingPrize({...editingPrize, icon: e.target.value})} 
                  placeholder="Gift, Star..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingPrize(null)}>İptal</Button>
                <Button onClick={() => handleSave(editingPrize)}>Kaydet</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
