'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { generatePuzzle, GeneratedPuzzle } from '@/lib/generator';
import { PlayablePuzzleGrid } from './PlayablePuzzleGrid';
import { Check, MousePointerClick, Printer, RefreshCw, Trophy } from 'lucide-react';

interface ThemedPuzzlePlayerProps {
  title: string;
  words: string[];
  width: number;
  height: number;
  difficulty: number;
  // Generated at build time from the theme's seed so the static HTML and the
  // first client render show the same grid.
  initialPuzzle: GeneratedPuzzle;
}

export default function ThemedPuzzlePlayer({ title, words, width, height, difficulty, initialPuzzle }: ThemedPuzzlePlayerProps) {
  const [puzzle, setPuzzle] = useState<GeneratedPuzzle>(initialPuzzle);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());

  const totalUniqueWords = useMemo(() => new Set(puzzle.placedWords.map(w => w.word)).size, [puzzle]);
  const isComplete = totalUniqueWords > 0 && foundWords.size === totalUniqueWords;

  const handleWordFound = useCallback((word: string) => {
    setFoundWords(prev => new Set(prev).add(word));
  }, []);

  const handleNewGrid = () => {
    setPuzzle(generatePuzzle({ width, height, words, allowBackwards: true, allowDiagonals: true, difficulty }));
    setFoundWords(new Set());
  };

  const builderQuery = {
    title,
    words: words.join(','),
    width: String(width),
    height: String(height),
    difficulty: String(difficulty),
  };

  return (
    <div>
      <div
        className={`mb-4 mx-auto max-w-md p-3 rounded-lg text-center font-medium transition-colors border ${
          isComplete ? 'bg-green-100 text-green-800 border-green-200' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
        }`}
        role="status"
        aria-live="polite"
      >
        {isComplete ? (
          <span className="flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5" />
            Puzzle Complete!
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2 text-sm">
            <MousePointerClick className="w-4 h-4" />
            Drag to select • Found {foundWords.size} of {totalUniqueWords}
          </span>
        )}
      </div>

      <div className="flex justify-center mb-6">
        <PlayablePuzzleGrid
          grid={puzzle.grid}
          placedWords={puzzle.placedWords}
          foundWords={foundWords}
          onWordFound={handleWordFound}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          onClick={handleNewGrid}
          className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          New Grid
        </button>
        <Link
          href={{ pathname: '/create', query: builderQuery }}
          rel="nofollow"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
        >
          <Printer className="w-4 h-4 mr-2" />
          Customize or Print
        </Link>
      </div>

      <h2 className="text-lg font-semibold mb-4 border-b border-gray-300 pb-2">Word Bank</h2>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {puzzle.placedWords.map((item, idx) => {
          const found = foundWords.has(item.word);
          return (
            <li
              key={idx}
              className={`flex items-center text-sm md:text-base transition-colors ${found ? 'line-through text-gray-400 decoration-gray-400' : ''}`}
            >
              <span
                className={`inline-flex items-center justify-center border mr-2 flex-shrink-0 w-4 h-4 ${found ? 'border-green-500 bg-green-50' : 'border-gray-400'}`}
                aria-hidden="true"
              >
                {found && <Check className="text-green-600 w-3 h-3" strokeWidth={3} />}
              </span>
              <span>
                {item.word}
                {found && <span className="sr-only"> (Found)</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
