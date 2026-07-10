"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { WheelSegment } from './WheelSegment';
import { WheelPointer } from './WheelPointer';
import { SpinButton } from './SpinButton';
import { useRouter } from 'next/navigation';

export interface CampaignSegment {
  id: string;
  title: string;
  color: string;
  textColor: string;
  icon?: string;
  imageUrl?: string;
}

interface SpinWheelProps {
  segments: CampaignSegment[];
  hasSpun: boolean;
  onSpinSuccess?: (prizeTitle: string) => void;
}

export function SpinWheel({ segments, hasSpun, onSpinSuccess }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSpin = async () => {
    if (isSpinning || hasSpun) return;
    setIsSpinning(true);
    setError(null);
    
    try {
      const res = await fetch('/api/spin', { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Bir hata oluştu.');
      }

      const winningIndex = segments.findIndex(s => s.id === data.prize_id);
      if (winningIndex === -1) {
        throw new Error('Ödül animasyonu hazırlanamadı.');
      }

      // Calculate perfect landing angle without any Math.random()
      const degrees = 360 / segments.length;
      const targetRotation = (360 * 5) - (winningIndex * degrees + (degrees / 2));
      
      // Update rotation (add to previous rotation so we don't snap back)
      // Actually we start at 0, so just setting it works for a single spin.
      // Since they can only spin once, this is fine.
      setRotation(targetRotation);
      
      // Smooth deceleration animation length is 5 seconds
      setTimeout(() => {
        setIsSpinning(false);
        if (onSpinSuccess) onSpinSuccess(data.title);
        router.push('/sonuc');
      }, 5000);

    } catch (err: any) {
      setError(err.message);
      setIsSpinning(false);
    }
  };

  if (segments.length === 0) {
    return <div className="text-center text-gray-500">Aktif ödül bulunmamaktadır.</div>;
  }

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-[400px] mx-auto">
      {/* Container for the wheel and pointer */}
      <div className="relative flex items-center justify-center w-full aspect-square max-w-[320px]">
        
        {/* Luxury shadow/glow behind the wheel */}
        <div className="absolute inset-4 rounded-full shadow-premium bg-transparent" />
        
        {/* SVG Wheel */}
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 320 320"
          className="relative z-10 drop-shadow-2xl"
          animate={{ rotate: rotation }}
          transition={{
            duration: 5,
            ease: [0.1, 0.9, 0.2, 1], // Realistic smooth easing
          }}
        >
          {/* Wheel background / outer border */}
          <circle cx="160" cy="160" r="160" fill="var(--color-luxury-gold)" />
          
          <g>
            {segments.map((segment, index) => (
              <WheelSegment
                key={segment.id}
                segment={segment}
                index={index}
                totalSegments={segments.length}
                radius={156}
                centerX={160}
                centerY={160}
              />
            ))}
          </g>
          
          {/* Center decorative hub */}
          <circle cx="160" cy="160" r="28" fill="var(--color-luxury-white)" />
          <circle cx="160" cy="160" r="24" fill="var(--color-luxury-black)" />
          <circle cx="160" cy="160" r="8" fill="var(--color-luxury-gold)" />
        </motion.svg>

        {/* Fixed pointer at the top */}
        <div className="absolute top-[-16px] left-1/2 -translate-x-1/2 z-20">
          <WheelPointer />
        </div>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-md w-full">
          {error}
        </div>
      )}

      {/* Action Button */}
      {hasSpun ? (
        <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-bold text-lg text-center cursor-not-allowed">
          Çevirme Hakkınız Kullanıldı
        </div>
      ) : (
        <SpinButton isSpinning={isSpinning} onClick={handleSpin} />
      )}
    </div>
  );
}
