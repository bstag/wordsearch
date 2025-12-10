import React, { Suspense } from 'react';
import WordSearchBuilder from '@/components/WordSearchBuilder';

export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <WordSearchBuilder />
    </Suspense>
  );
}
