'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Import CatGame with no SSR to ensure it only loads on the client
const CatGame = dynamic(() => import('./CatGame'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <div className="text-center p-4">
        <div className="text-2xl font-bold mb-4">Loading Cat Game...</div>
        <div className="text-gray-500 animate-pulse">
          Please wait while the 3D environment initializes
        </div>
      </div>
    </div>
  ),
});

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <div className="text-2xl font-bold mb-4">Loading...</div>
            <div className="text-gray-500 animate-pulse">Preparing game environment</div>
          </div>
        </div>
      }
    >
      <CatGame />
    </Suspense>
  );
}
