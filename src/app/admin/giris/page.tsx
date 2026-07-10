"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { adminService } from '@/services/admin.service';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await adminService.login({ username, password });
      // Hard navigation to synchronize cookies and trigger edge middleware correctly
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message || 'Giriş yapılamadı.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 p-4 sm:p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif">Admin Girişi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              label="Kullanıcı Adı" 
              placeholder="admin" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
            <Input 
              label="Şifre" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            
            {error && (
              <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full mt-6" isLoading={isLoading}>
              Giriş
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
