import React from 'react';

interface SpinButtonProps {
  isSpinning: boolean;
  onClick: () => void;
}

export function SpinButton({ isSpinning, onClick }: SpinButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isSpinning}
      className={`
        relative overflow-hidden
        h-14 px-12 rounded-full
        flex items-center justify-center
        font-medium text-[16px] tracking-widest transition-all duration-300
        ${isSpinning 
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed scale-95 opacity-80' 
          : 'bg-luxury-black text-luxury-gold hover:scale-[1.02] active:scale-[0.98] shadow-premium cursor-pointer'
        }
      `}
      style={{
        minWidth: '200px', // Ensures a nice touch target
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span className="relative z-10">{isSpinning ? 'ÇEVRİLİYOR...' : 'ŞİMDİ ÇEVİR'}</span>
    </button>
  );
}
