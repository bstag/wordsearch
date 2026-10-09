import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Link2, MousePointerClick, PenLine, Printer, SlidersHorizontal, Smartphone } from 'lucide-react';
import ThemedPuzzlePlayer from '@/components/ThemedPuzzlePlayer';
import LegacyShareRedirect from '@/components/LegacyShareRedirect';
import { getCategories, getFeaturedPuzzle, themedPlayerProps } from '@/lib/themes';
import { FAQ } from '@/lib/faq';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: { absolute: 'Free Word Search Generator | Make, Print & Play Puzzles' },
  description: 'Make your own word search in seconds, or play free themed puzzles online. Print with an answer key or share by link. No signup required.',
  alternates: { canonical: '/' },
};

const STEPS = [
  { icon: PenLine, title: 'Add your words', text: 'Type or paste up to 100 words: spelling lists, names, vocabulary, anything.' },
  { icon: SlidersHorizontal, title: 'Tune the grid', text: 'Pick a size, allow diagonal or backwards words, and set how many decoys to hide.' },
  { icon: Printer, title: 'Play, print, or share', text: 'Solve it on screen, print it with an answer key, or send a link.' },
];

const FEATURES = [
  { icon: Printer, title: 'Printable with answer key', text: 'Clean one-page layout sized to fit, plus a solution page.' },
  { icon: MousePointerClick, title: 'Play online', text: 'Drag across letters to mark words. Found words light up and cross off.' },
  { icon: Smartphone, title: 'Works on any device', text: 'Touch-friendly on phones, tablets, and Chromebooks.' },
  { icon: Link2, title: 'Share by link', text: 'Your words and settings travel in the link. Nothing is stored on a server.' },
];

export default function HomePage() {
  const featured = getFeaturedPuzzle();
  const categories = getCategories();

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: `${SITE_URL}/create`,
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free online tool to create, print, and play custom word search puzzles.',
    },
  ];

  return (
    <main>
      <LegacyShareRedirect />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Free Word Search Generator</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Make a custom word search from your own words in seconds, or jump into a ready-made puzzle.
            Play it online, print it with an answer key, or share it with a link.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/create"
              className="inline-flex items-center px-6 py-3 rounded-md shadow-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
            >
              <PenLine className="w-5 h-5 mr-2" />
              Make a Word Search
            </Link>
            <Link
              href="/puzzles"
              className="inline-flex items-center px-6 py-3 rounded-md border border-gray-300 font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
            >
              Browse Puzzles
            </Link>
          </div>
        </div>
      </section>

      {/* Featured puzzle */}
      <section className="max-w-4xl mx-auto px-4 py-12" aria-labelledby="featured-heading">
        <div className="text-center mb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 mb-1">Try one now</p>
          <h2 id="featured-heading" className="text-2xl md:text-3xl font-bold">
            <Link href={`/puzzles/${featured.slug}`} className="hover:text-indigo-700">{featured.title} Word Search</Link>
          </h2>
        </div>
        <ThemedPuzzlePlayer {...themedPlayerProps(featured)} />
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-center mb-8">Make your own in three steps</h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="text-center">
                <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <step.icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-1">{i + 1}. {step.title}</h3>
                <p className="text-sm text-gray-600">{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="text-center mt-8">
            <Link href="/create" className="font-semibold text-indigo-600 hover:text-indigo-800">Open the word search maker →</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">Everything you need, nothing you don&apos;t</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(f => (
            <li key={f.title} className="flex gap-4 p-5 rounded-lg bg-white border border-gray-200">
              <f.icon className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-center text-sm text-gray-600 mt-6">
          Great for teachers, homeschool, parties, road trips, and anyone who likes a quiet puzzle. No signup, nothing to install.
        </p>
      </section>

      {/* Themes */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-center mb-8">Puzzles by theme</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(category => (
              <div key={category.name}>
                <h3 className="font-semibold mb-2">{category.name}</h3>
                <ul className="space-y-1">
                  {category.puzzles.map(p => (
                    <li key={p.slug}>
                      <Link href={`/puzzles/${p.slug}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                        {p.title} Word Search
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-6">Common questions</h2>
        <div className="space-y-3">
          {FAQ.slice(0, 4).map(item => (
            <details key={item.question} className="group rounded-lg bg-white border border-gray-200 p-4">
              <summary className="font-semibold cursor-pointer list-none flex justify-between gap-4">
                {item.question}
                <span className="text-gray-400 group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
              </summary>
              <p className="mt-2 text-gray-600 text-sm">{item.answer}</p>
            </details>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/faq" className="font-semibold text-indigo-600 hover:text-indigo-800">See all FAQs →</Link>
        </div>
      </section>
    </main>
  );
}
