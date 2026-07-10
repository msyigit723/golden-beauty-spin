import React from 'react';

export function WheelPointer() {
  return (
    <div className="relative w-10 h-12 drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]">
      <svg
        viewBox="0 0 32 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Pointer body */}
        <path
          d="M16 40L2 16C-2 8 4 0 16 0C28 0 34 8 30 16L16 40Z"
          fill="var(--color-luxury-black)"
          stroke="var(--color-luxury-gold)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Inner circle accent */}
        <circle cx="16" cy="13" r="4" fill="var(--color-luxury-gold)" />
      </svg>
    </div>
  );
}
