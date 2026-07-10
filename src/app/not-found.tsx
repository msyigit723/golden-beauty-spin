import * as React from 'react';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <h1 className="mb-4 font-serif text-6xl font-bold text-luxury-gold">404</h1>
      <h2 className="mb-4 text-2xl font-semibold text-luxury-black">Sayfa Bulunamadı</h2>
      <p className="mb-8 text-gray-500">
        Aradığınız sayfaya şu anda ulaşılamıyor.
      </p>
      <a 
        href="/"
        className="inline-flex h-12 items-center justify-center rounded-lg bg-luxury-black px-6 text-base font-medium text-luxury-white transition-colors hover:bg-luxury-charcoal focus:outline-none focus:ring-2 focus:ring-luxury-black focus:ring-offset-2"
      >
        Ana Sayfaya Dön
      </a>
    </div>
  );
}
