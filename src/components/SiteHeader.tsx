import Link from 'next/link';
import { Grid3x3 } from 'lucide-react';

const NAV = [
  { href: '/create', label: 'Create' },
  { href: '/puzzles', label: 'Puzzles' },
  { href: '/faq', label: 'FAQ' },
];

export default function SiteHeader() {
  return (
    <header className="bg-white border-b border-gray-200 print:hidden">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-indigo-700 shrink-0">
          <Grid3x3 className="w-5 h-5" aria-hidden="true" />
          <span className="sm:hidden">Word Search</span>
          <span className="hidden sm:inline">Word Search Generator</span>
        </Link>
        <nav aria-label="Main">
          <ul className="flex items-center sm:gap-4 text-sm font-medium">
            {NAV.map(item => (
              <li key={item.href}>
                <Link href={item.href} className="px-2 py-1 rounded-md text-gray-600 hover:text-indigo-700 hover:bg-indigo-50">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
