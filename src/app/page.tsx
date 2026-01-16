import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import WordSearchBuilder from '@/components/WordSearchBuilder';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Create Your Puzzle',
  description: 'Free online word search maker. Create custom printable puzzles, play online, or share with friends.',
};

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Word Search Generator',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Free online tool to create, print, and play custom word search puzzles.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
        <WordSearchBuilder />
      </Suspense>
    </>
  );
}
