import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <h1 className="mb-4 font-serif text-4xl font-bold tracking-tight text-luxury-black sm:text-5xl">
        Şansınızı Çevirin
      </h1>
      <p className="mb-8 max-w-md text-base text-gray-600 sm:text-lg">
        Golden Beauty ayrıcalıklarıyla dolu sürpriz hediyeler kazanmak için çarkı çevirin.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-4 sm:flex-row sm:max-w-md">
        <Link href="/giris" className="w-full">
          <Button size="lg" className="w-full">
            Giriş Yap
          </Button>
        </Link>
        <Link href="/kayit" className="w-full">
          <Button variant="outline" size="lg" className="w-full">
            Kayıt Ol
          </Button>
        </Link>
      </div>
    </div>
  );
}
