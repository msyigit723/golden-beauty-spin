"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

type Metrics = {
  totalUsers: number;
  totalSpins: number;
  remainingStock: number;
  activeCampaign: string;
  prizeDistribution: { title: string, count: number }[];
};

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/admin/metrics');
        if (res.ok) {
          setMetrics(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Metrikler yükleniyor...</div>;
  if (!metrics) return <div className="p-8 text-center text-red-500">Metrikler yüklenemedi.</div>;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold text-luxury-black mb-2">Yönetim Paneli</h1>
        <p className="text-gray-500">Golden Beauty Spin güncel istatistikleri ve performans verileri.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Toplam Kullanıcı</h3>
            <p className="text-3xl font-bold text-luxury-black">{metrics.totalUsers}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Toplam Çevirme</h3>
            <p className="text-3xl font-bold text-luxury-black">{metrics.totalSpins}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Aktif Kampanya</h3>
            <p className="text-lg font-bold text-luxury-black truncate" title={metrics.activeCampaign}>
              {metrics.activeCampaign}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Kalan Stok (Aktif)</h3>
            <p className="text-3xl font-bold text-luxury-gold">{metrics.remainingStock}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ödül Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.prizeDistribution.length === 0 ? (
              <p className="text-gray-500 text-sm">Henüz hiç ödül kazanılmadı.</p>
            ) : (
              <div className="space-y-4">
                {metrics.prizeDistribution.map((prize, idx) => {
                  const maxCount = Math.max(...metrics.prizeDistribution.map(p => p.count), 1);
                  const percentage = Math.round((prize.count / maxCount) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{prize.title}</span>
                        <span className="text-gray-500">{prize.count} kez kazanıldı</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-luxury-gold transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/admin/spins" className="block w-full p-3 text-sm text-center border rounded-lg hover:border-luxury-gold hover:text-luxury-gold transition-colors">
              Kazananları Listele ve Dışa Aktar
            </a>
            <a href="/admin/prizes" className="block w-full p-3 text-sm text-center border rounded-lg hover:border-luxury-gold hover:text-luxury-gold transition-colors">
              Stokları ve Ödülleri Yönet
            </a>
            <a href="/admin/campaigns" className="block w-full p-3 text-sm text-center border rounded-lg hover:border-luxury-gold hover:text-luxury-gold transition-colors">
              Yeni Kampanya Başlat
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
