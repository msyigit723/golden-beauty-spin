import * as React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[50vh]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-luxury-gold"></div>
    </div>
  );
}
