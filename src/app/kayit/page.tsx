'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { validatePhone, validatePassword, validateRequired } from '@/utils/validation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    name: '',
    surname: '',
    phone: '',
    password: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [globalError, setGlobalError] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear field specific error when typing
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
    setGlobalError('');
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void processSubmit();
  };

  const processSubmit = async () => {
    setGlobalError('');
    setSuccessMsg('');
    
    // Client-side Validation
    const newErrors: Record<string, string> = {};
    if (!validateRequired(formData.name)) newErrors.name = 'Ad alanı zorunludur.';
    if (!validateRequired(formData.surname)) newErrors.surname = 'Soyad alanı zorunludur.';
    if (!validateRequired(formData.phone)) {
      newErrors.phone = 'Telefon alanı zorunludur.';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Geçersiz telefon formatı. Örn: 05XXXXXXXXX';
    }
    if (!validateRequired(formData.password)) {
      newErrors.password = 'Şifre alanı zorunludur.';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Şifre en az 8 karakter olmalıdır.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        name: formData.name,
        surname: formData.surname,
        phone: formData.phone,
        password: formData.password,
      });
      setSuccessMsg('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      window.location.href = '/giris';
    } catch (err: any) {
      setGlobalError(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-6 bg-gray-50/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif">Kayıt Ol</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="name"
                label="Ad"
                placeholder="Adınız"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                disabled={isLoading || !!successMsg}
              />
              <Input
                name="surname"
                label="Soyad"
                placeholder="Soyadınız"
                value={formData.surname}
                onChange={handleChange}
                error={errors.surname}
                disabled={isLoading || !!successMsg}
              />
            </div>
            <Input
              name="phone"
              label="Telefon"
              type="tel"
              placeholder="05XX XXX XX XX"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              disabled={isLoading || !!successMsg}
            />
            <Input
              name="password"
              label="Şifre"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              disabled={isLoading || !!successMsg}
            />
            
            {globalError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 font-medium">
                {globalError}
              </div>
            )}
            
            {successMsg && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 font-medium">
                {successMsg}
              </div>
            )}

            <Button
              type="button"
              onClick={() => void processSubmit()}
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              disabled={!!successMsg}
            >
              Hesap Oluştur
            </Button>
            
            <p className="text-center text-sm text-gray-500 pt-2">
              Zaten hesabınız var mı?{' '}
              <a href="/giris" className="font-semibold text-luxury-gold hover:underline">
                Giriş Yap
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
