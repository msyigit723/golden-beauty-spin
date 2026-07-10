"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body>
        <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-luxury-white text-center">
          <div className="max-w-md space-y-6">
            <h1 className="text-4xl font-serif font-bold text-luxury-black">Sistem Bakımda</h1>
            <p className="text-gray-600">
              Şu anda sistemlerimizde geçici bir yoğunluk veya bakım çalışması yaşanıyor. Lütfen kısa bir süre sonra tekrar deneyin.
            </p>
            <Button onClick={() => window.location.reload()} className="w-full h-12">
              Sayfayı Yenile
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
