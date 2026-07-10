"use client";

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // We can log this to an external service like Sentry here
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-luxury-white text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-3xl font-serif font-bold text-luxury-black">Beklenmeyen Bir Hata Oluştu</h1>
        <p className="text-gray-600 text-sm">
          Sayfayı yüklerken bir sorun meydana geldi. İnternet bağlantınızı kontrol edip tekrar deneyebilirsiniz.
        </p>
        <Button onClick={() => reset()} className="w-full h-12">
          Yeniden Dene
        </Button>
      </div>
    </div>
  );
}
