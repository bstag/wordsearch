import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { THEMED_PUZZLES, getThemedPuzzle, themedPlayerProps } from '@/lib/themes';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import ThemedPuzzlePlayer from '@/components/ThemedPuzzlePlayer';

export const dynamicParams = false;

export function generateStaticParams() {
  return THEMED_PUZZLES.map(p => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const theme = getThemedPuzzle((await params).slug);
  if (!theme) return {};

  const title = `${theme.title} Word Search`;
  const path = `/puzzles/${theme.slug}`;
  return {
    title,
    description: theme.description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      title: `${title} | ${SITE_NAME}`,
      description: theme.description,
      siteName: SITE_NAME,
    },
  };
}

export default async function ThemedPuzzlePage({ params }: Props) {
  const theme = getThemedPuzzle((await params).slug);
  if (!theme) notFound();

  const related = THEMED_PUZZLES.filter(p => p.category === theme.category && p.slug !== theme.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: `${theme.title} Word Search`,
    description: theme.description,
    url: `${SITE_URL}/puzzles/${theme.slug}`,
    genre: 'Word search puzzle',
    isAccessibleForFree: true,
    keywords: theme.words.join(', ').toLowerCase(),
  };

  return (
    <main className="p-4 md:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="max-w-4xl mx-auto">
        <nav className="mb-4 text-sm">
          <Link href="/puzzles" className="inline-flex items-center text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            All puzzles
          </Link>
        </nav>

        <header className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider mb-2">{theme.title} Word Search</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{theme.description}</p>
        </header>

        <ThemedPuzzlePlayer {...themedPlayerProps(theme)} />

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-semibold mb-3">More {theme.category} puzzles</h2>
            <ul className="flex flex-wrap gap-2">
              {related.map(p => (
                <li key={p.slug}>
                  <Link
                    href={`/puzzles/${p.slug}`}
                    className="inline-block px-3 py-1.5 rounded-full border border-gray-300 bg-white text-sm hover:border-indigo-400 hover:text-indigo-700"
                  >
                    {p.title} Word Search
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500 text-center">
          Want your own words? <Link href="/create" className="text-indigo-600 hover:text-indigo-800">Make a custom word search</Link>.
        </p>
      </div>
    </main>
  );
}
