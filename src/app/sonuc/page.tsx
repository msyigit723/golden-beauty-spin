import * as React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

export default function ResultPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md border-luxury-gold/30 bg-luxury-black text-luxury-white">
        <CardContent className="flex flex-col items-center p-8 text-center space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-luxury-gold text-luxury-black">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold mb-2">Tebrikler!</h1>
            <p className="text-luxury-white/80 text-lg">
              [Kampanya Adı] Kazandınız!
            </p>
          </div>
          <p className="text-sm text-luxury-white/60">
            Detaylı bilgi için sizinle iletişime geçeceğiz.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
