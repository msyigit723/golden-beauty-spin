import * as React from 'react';
import { cn } from '@/utils/cn';

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'dark' | 'light' | 'gold';
}

function Logo({ className, variant = 'dark', ...props }: LogoProps) {
  return (
    <div
      className={cn(
        'font-serif text-2xl font-bold tracking-widest',
        {
          'text-luxury-black': variant === 'dark',
          'text-luxury-white': variant === 'light',
          'text-luxury-gold': variant === 'gold',
        },
        className
      )}
      {...props}
    >
      GOLDEN
      <span className="block text-xs font-sans tracking-[0.3em] font-medium opacity-80 mt-1">
        BEAUTY SPIN
      </span>
    </div>
  );
}

export { Logo };
