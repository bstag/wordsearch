import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import WordSearchBuilder from '@/components/WordSearchBuilder';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { searchParams }: Props,
): Promise<Metadata> {
  const params = await searchParams;
  const title = typeof params.title === 'string' 
    ? decodeURIComponent(params.title) 
    : undefined;

  if (title && title !== 'My Word Search') {
    return {
      title: title,
      description: `Play "${title}" - a custom word search puzzle created with Word Search Generator.`,
      openGraph: {
        title: `${title} | Word Search Generator`,
        description: `Play "${title}" - a custom word search puzzle.`,
      }
    }
  }

  return {
    title: 'Create Your Puzzle',
  }
}

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
