import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16 print:hidden">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row gap-4 justify-between text-sm text-gray-500">
        <p>© StagWare. Free word search puzzles to make, print, and play.</p>
        <ul className="flex flex-wrap gap-4">
          <li><Link href="/create" className="hover:text-gray-800">Word Search Maker</Link></li>
          <li><Link href="/puzzles" className="hover:text-gray-800">Puzzles</Link></li>
          <li><Link href="/faq" className="hover:text-gray-800">FAQ</Link></li>
          <li><a href="https://github.com/bstag/wordsearch" className="hover:text-gray-800" target="_blank" rel="noopener noreferrer">GitHub</a></li>
        </ul>
      </div>
    </footer>
  );
}
