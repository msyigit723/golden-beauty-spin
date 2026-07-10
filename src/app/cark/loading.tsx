import React from 'react';

export default function Loading() {
  return (
    <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center min-h-[100dvh] animate-pulse">
      
      {/* Header Skeleton */}
      <div className="text-center mb-8 mt-4 w-full max-w-lg flex flex-col items-center">
        {/* Banner */}
        <div className="w-full h-32 bg-gray-200 rounded-2xl mb-6"></div>
        {/* Title */}
        <div className="h-10 w-48 bg-gray-200 rounded-lg mb-3"></div>
        {/* Subtitle */}
        <div className="h-4 w-64 bg-gray-200 rounded-lg"></div>
      </div>
      
      {/* Wheel Area Skeleton */}
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gray-200 shadow-sm relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white absolute z-20"></div>
        </div>
      </div>
      
      {/* Footer Skeleton */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="h-3 w-40 bg-gray-200 rounded"></div>
        <div className="h-3 w-32 bg-gray-200 rounded"></div>
      </div>
      
    </div>
  );
}
