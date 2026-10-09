import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import WordSearchBuilder from '@/components/WordSearchBuilder';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Word Search Maker – Create Custom Printable Puzzles',
  description: 'Type your words, choose a grid size and difficulty, and get a custom word search to play online or print with an answer key. Free, no signup.',
  // Shared configs live in the query string; they should all fold into one URL.
  alternates: { canonical: '/create' },
};

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <WordSearchBuilder />
    </Suspense>
  );
}
