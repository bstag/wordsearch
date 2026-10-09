import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategories } from '@/lib/themes';
import { SITE_NAME } from '@/lib/site';

const DESCRIPTION = 'Free printable and playable word search puzzles by theme: animals, holidays, science, food, sports, and more. Play online or customize and print.';

export const metadata: Metadata = {
  title: 'Free Word Search Puzzles by Theme',
  description: DESCRIPTION,
  alternates: { canonical: '/puzzles' },
  openGraph: {
    type: 'website',
    url: '/puzzles',
    title: `Free Word Search Puzzles by Theme | ${SITE_NAME}`,
    description: DESCRIPTION,
    siteName: SITE_NAME,
  },
};

export default function PuzzlesIndexPage() {
  const categories = getCategories();

  return (
    <main className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Free Word Search Puzzles</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Pick a theme and play right in your browser, or open any puzzle in the generator to change the words and print it with an answer key.
          </p>
        </header>

        {categories.map(category => (
          <section key={category.name} className="mb-8">
            <h2 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-2">{category.name}</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {category.puzzles.map(p => (
                <li key={p.slug}>
                  <Link
                    href={`/puzzles/${p.slug}`}
                    className="block h-full p-4 rounded-lg border border-gray-200 bg-white hover:border-indigo-400 hover:shadow-sm transition"
                  >
                    <span className="block font-semibold text-indigo-700">{p.title} Word Search</span>
                    <span className="block text-sm text-gray-600 mt-1">{p.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500 text-center">
          Don&apos;t see your topic? <Link href="/create" className="text-indigo-600 hover:text-indigo-800">Make a custom word search</Link>.
        </p>
      </div>
    </main>
  );
}
