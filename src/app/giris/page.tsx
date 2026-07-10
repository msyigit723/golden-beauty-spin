'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { validatePhone, validateRequired } from '@/utils/validation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    phone: '',
    password: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [globalError, setGlobalError] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    if (!validateRequired(formData.phone)) {
      newErrors.phone = 'Telefon alanı zorunludur.';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Geçersiz telefon formatı. Örn: 05XXXXXXXXX';
    }
    if (!validateRequired(formData.password)) {
      newErrors.password = 'Şifre alanı zorunludur.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await authService.login({
        phone: formData.phone,
        password: formData.password,
      });
      setSuccessMsg('Giriş başarılı! Yönlendiriliyorsunuz...');
      window.location.href = '/cark';
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
          <CardTitle className="text-2xl font-serif">Giriş Yap</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
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
              Giriş Yap
            </Button>

            <p className="text-center text-sm text-gray-500 pt-2">
              Hesabınız yok mu?{' '}
              <a href="/kayit" className="font-semibold text-luxury-gold hover:underline">
                Kayıt Ol
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
