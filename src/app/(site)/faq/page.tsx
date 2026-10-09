import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FAQ } from '@/lib/faq';
import { SITE_NAME } from '@/lib/site';

const DESCRIPTION = 'Answers about making, printing, playing, and sharing word search puzzles with the free Word Search Generator.';

export const metadata: Metadata = {
  title: 'Word Search FAQ',
  description: DESCRIPTION,
  alternates: { canonical: '/faq' },
  openGraph: {
    type: 'website',
    url: '/faq',
    title: `Word Search FAQ | ${SITE_NAME}`,
    description: DESCRIPTION,
    siteName: SITE_NAME,
  },
};

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
      <p className="text-gray-600 mb-8">Everything about making, playing, and printing word searches here.</p>

      <div className="space-y-6">
        {FAQ.map(item => (
          <section key={item.question} className="rounded-lg bg-white border border-gray-200 p-5">
            <h2 className="text-lg font-semibold mb-2">{item.question}</h2>
            <p className="text-gray-700">{item.answer}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-gray-600 mb-3">Ready to try it?</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/create" className="inline-flex px-5 py-2.5 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700">
            Make a Word Search
          </Link>
          <Link href="/puzzles" className="inline-flex px-5 py-2.5 rounded-md border border-gray-300 font-semibold text-gray-700 bg-white hover:bg-gray-50">
            Browse Puzzles
          </Link>
        </div>
      </div>
    </main>
  );
}
