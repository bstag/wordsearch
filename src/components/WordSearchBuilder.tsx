'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useQueryState, parseAsBoolean, parseAsInteger, parseAsString, createParser } from 'nuqs';
import { generatePuzzle, GeneratedPuzzle } from '@/lib/generator';
import { getRandomDefaultWords } from '@/lib/wordPool';
import { PuzzleGrid, AnswerKeyGrid } from './PuzzleGrids';
import { PlayablePuzzleGrid } from './PlayablePuzzleGrid';
import { Printer, RefreshCw, Settings, Type, Github, AlertCircle, Share2, Check, Eye, EyeOff, Play, Dice5, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

export default function WordSearchBuilder() {
  // State synced with URL
  const [title, setTitle] = useQueryState('title', parseAsString.withDefault('My Word Search'));
  const [width, setWidth] = useQueryState('width', parseAsInteger.withDefault(15));
  const [height, setHeight] = useQueryState('height', parseAsInteger.withDefault(15));

  // Security: Limit input length to prevent DoS via URL (matches UI maxLength)
  const parseAsLimitedString = createParser({
    parse: (queryValue) => {
      const parsed = parseAsString.parse(queryValue);
      return parsed && parsed.length > 2500 ? parsed.slice(0, 2500) : parsed;
    },
    serialize: (value) => parseAsString.serialize(value),
  });

  // We use a specific placeholder to detect if we should randomize on first load
  const [wordsRaw, setWordsRaw] = useQueryState('words', parseAsLimitedString.withDefault(''));
  const [allowBackwards, setAllowBackwards] = useQueryState('backwards', parseAsBoolean.withDefault(true));
  const [allowDiagonals, setAllowDiagonals] = useQueryState('diagonals', parseAsBoolean.withDefault(true));
  const [showGridLines, setShowGridLines] = useQueryState('gridLines', parseAsBoolean.withDefault(false));
  const [showAnswerKey, setShowAnswerKey] = useQueryState('answerKey', parseAsBoolean.withDefault(true));
  const [difficulty, setDifficulty] = useQueryState('difficulty', parseAsInteger.withDefault(5));
  const [runMode, setRunMode] = useQueryState('run', parseAsBoolean.withDefault(false));

  // Initialize random words if empty
  useEffect(() => {
    if (!wordsRaw || wordsRaw === 'LION,TIGER,BEAR') {
      setWordsRaw(getRandomDefaultWords());
    }
  }, []); // Only run on mount (or when wordsRaw is initially checked, but we want to avoid loops)

  // Internal state for the generated puzzle
  const [puzzle, setPuzzle] = useState<GeneratedPuzzle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());

  // Validate words against grid dimensions
  const invalidWords = useMemo(() => {
    const maxLen = Math.max(width, height);
    return wordsRaw
      .split(/[\n,]+/)
      .map(w => w.trim())
      .filter(w => w.length > maxLen);
  }, [wordsRaw, width, height]);

  const handleRandomizeWords = () => {
    setWordsRaw(getRandomDefaultWords());
  };

  const handleShare = async () => {
    try {
      const url = new URL(window.location.href);
      if (runMode) {
        url.searchParams.set('run', 'true');
      }
      await navigator.clipboard.writeText(url.toString());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleWordFound = (word: string) => {
    setFoundWords(prev => {
      const newSet = new Set(prev);
      newSet.add(word);
      return newSet;
    });
  };

  const generate = useCallback(() => {
    // If no words, don't try to generate (avoids ZodError)
    const wordList = wordsRaw.split(/[\n,]+/).map(w => w.trim()).filter(w => w.length > 0);
    if (wordList.length === 0) {
      setPuzzle(null);
      return;
    }

    setIsGenerating(true);
    setError(null);
    // Small timeout to allow UI to update if it was blocking
    setTimeout(() => {
      try {
        const config = {
          width,
          height,
          words: wordList,
          allowBackwards,
          allowDiagonals,
          difficulty
        };
        const result = generatePuzzle(config);
        setPuzzle(result);
        setFoundWords(new Set());
      } catch (err) {
        console.error('Generation failed:', err);
        if (err instanceof z.ZodError) {
          const toFriendlyFieldName = (path: PropertyKey[]): string => {
            if (!path || path.length === 0) {
              return 'Configuration';
            }
            const [first] = path;
            if (first === 'width') {
              return 'Grid width';
            }
            if (first === 'height') {
              return 'Grid height';
            }
            if (first === 'words') {
              return 'Words list';
            }
            // Fallback to the raw path for any unexpected fields
            return path.map(String).join('.');
          };

          const fieldMessages = err.issues.reduce<Record<string, string[]>>((acc, issue) => {
            const fieldName = toFriendlyFieldName(issue.path);
            if (!acc[fieldName]) {
              acc[fieldName] = [];
            }
            acc[fieldName].push(issue.message);
            return acc;
          }, {});

          const messages = Object.entries(fieldMessages)
            .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
            .join('; ');

          setError(`Invalid configuration: ${messages}`);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred while generating the puzzle.');
        }
        setPuzzle(null);
      } finally {
        setIsGenerating(false);
      }
    }, 10);
  }, [width, height, wordsRaw, allowBackwards, allowDiagonals, difficulty]);

  // Debounced auto-generation on config changes could be nice, but let's stick to manual or effect-based
  // Let's auto-generate when config changes
  useEffect(() => {
    const timer = setTimeout(() => {
      generate();
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [width, height, wordsRaw, allowBackwards, allowDiagonals, difficulty, generate]);

  // Pre-calculate the solution grid for faster lookup (O(1) vs O(1) but avoids string allocs)
  const solutionGrid = useMemo(() => {
    if (!puzzle) return [];

    const rows = puzzle.grid.length;
    const cols = puzzle.grid[0].length;
    const grid = Array(rows).fill(null).map(() => Array(cols).fill(false));

    puzzle.placedWords.forEach(word => {
      const dx = Math.sign(word.endX - word.startX);
      const dy = Math.sign(word.endY - word.startY);
      const length = Math.max(Math.abs(word.endX - word.startX), Math.abs(word.endY - word.startY)) + 1;
      
      for (let i = 0; i < length; i++) {
        const x = word.startX + i * dx;
        const y = word.startY + i * dy;
        if (grid[y] && grid[y][x] !== undefined) {
          grid[y][x] = true;
        }
      }
    });
    return grid;
  }, [puzzle]);

  // Calculate dynamic cell size for print
  // Max printable width ~180mm (approx 700px), max height ~240mm (approx 900px) minus headers
  // Let's use 700px width and 600px height for the grid part to be safe
  const maxPrintWidth = 700;
  const maxPrintHeight = 600;

  // ⚡ Performance: Use active puzzle dimensions if available, otherwise fallback to config.
  // This prevents the print size from jumping around (and triggering grid re-renders)
  // while the user is typing in the width/height inputs, until the new puzzle is actually generated.
  const activeWidth = puzzle ? puzzle.grid[0].length : width;
  const activeHeight = puzzle ? puzzle.grid.length : height;

  const printCellSize = Math.floor(Math.min(maxPrintWidth / activeWidth, maxPrintHeight / activeHeight));
  const printFontSize = Math.floor(printCellSize * 0.65);

  // Calculate dynamic word bank size
  const wordCount = puzzle?.placedWords.length || 0;
  const wordBankCols = 4;
  const wordBankRows = Math.ceil(wordCount / wordBankCols);
  const gridHeightPx = activeHeight * printCellSize;
  // A4 printable height ~950px - grid - headers(~150px)
  const availableForWords = 950 - gridHeightPx - 150;
  
  let printWordBankSize = 12; // Base size
  if (wordBankRows > 0 && availableForWords > 0) {
     // Target line height is roughly 1.5em
     const maxPerLine = Math.floor(availableForWords / (wordBankRows * 1.5));
     printWordBankSize = Math.min(14, Math.max(8, maxPerLine));
  }

  // Detect potential overflow
  const isOverflowing = availableForWords < (wordBankRows * 1.5 * 8); // assuming min font size 8px

  // Adjust title size if we have many words to save vertical space
  const printTitleSize = wordCount > 20 ? '1.5rem' : '1.875rem'; // 2xl vs 3xl
  const printTitleMargin = wordCount > 20 ? '1rem' : '2rem'; // mb-4 vs mb-8

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans"
      style={{
        // @ts-expect-error - Custom CSS property
        '--print-cell-size': `${printCellSize}px`,
        '--print-font-size': `${printFontSize}px`,
        '--print-wordbank-size': `${printWordBankSize}px`,
        '--print-title-size': printTitleSize,
        '--print-title-margin': printTitleMargin,
      }}
    >
      <div className="flex flex-col md:flex-row min-h-screen">
        
        {/* Configuration Sidebar - Hidden on Print and Run Mode */}
        {!runMode && (
        <div className="w-full md:w-80 bg-white border-r border-gray-200 p-6 flex-shrink-0 print:hidden overflow-y-auto h-screen sticky top-0">
          <div className="mb-6 flex items-center gap-2 text-indigo-600">
            <Settings className="w-6 h-6" />
            <h1 className="text-xl font-bold">Config</h1>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">Puzzle Title</label>
              <input
                id="title"
                type="text"
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Grid Size */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="width" className="text-sm font-medium text-gray-700">Width</label>
                <input
                  id="width"
                  type="number"
                  min="5"
                  max="30"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value) || 15)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="height" className="text-sm font-medium text-gray-700">Height</label>
                <input
                  id="height"
                  type="number"
                  min="5"
                  max="30"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value) || 15)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Options */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-gray-700 mb-2">Directions</legend>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="backwards"
                  checked={allowBackwards}
                  onChange={(e) => setAllowBackwards(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="backwards" className="text-sm text-gray-600">Allow Backwards</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="diagonals"
                  checked={allowDiagonals}
                  onChange={(e) => setAllowDiagonals(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="diagonals" className="text-sm text-gray-600">Allow Diagonals</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="gridLines"
                  checked={showGridLines}
                  onChange={(e) => setShowGridLines(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="gridLines" className="text-sm text-gray-600">Show Grid Lines</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="answerKey"
                  checked={showAnswerKey}
                  onChange={(e) => setShowAnswerKey(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="answerKey" className="text-sm text-gray-600">Include Answer Key</label>
              </div>
            </fieldset>

            {/* Difficulty */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="difficulty" className="text-sm font-medium text-gray-700">Difficulty (Distractors)</label>
                <span className="text-xs text-gray-500 font-medium">
                  {difficulty}/10 <span className="text-gray-400">({
                    difficulty <= 2 ? 'Easy' :
                    difficulty <= 5 ? 'Medium' :
                    difficulty <= 8 ? 'Hard' : 'Expert'
                  })</span>
                </span>
              </div>
              <input
                id="difficulty"
                type="range"
                min="0"
                max="10"
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                aria-label="Difficulty level (number of distractors)"
                aria-valuetext={`${difficulty} out of 10, ${
                  difficulty <= 2 ? 'Easy' :
                  difficulty <= 5 ? 'Medium' :
                  difficulty <= 8 ? 'Hard' : 'Expert'
                }`}
              />
              <div className="flex justify-between text-[10px] text-gray-400 px-1 font-medium select-none" aria-hidden="true">
                <span>Easy</span>
                <span>Medium</span>
                <span>Hard</span>
                <span>Expert</span>
              </div>
            </div>

            {/* Word List */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="wordlist" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Word List
                </label>
                <button
                  onClick={handleRandomizeWords}
                  className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                  title="Generate random words"
                >
                  <Dice5 className="w-3 h-3" />
                  Randomize
                </button>
              </div>
              <textarea
                id="wordlist"
                maxLength={2500}
                value={wordsRaw}
                onChange={(e) => setWordsRaw(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                placeholder="Enter words separated by commas or newlines"
              />
              <p className="text-xs text-gray-500">
                {wordsRaw.split(/[\n,]+/).filter(w => w.trim().length > 0).length} words
              </p>
              {invalidWords.length > 0 && (
                <div role="alert" className="text-xs text-red-600 font-medium">
                  {invalidWords.length === 1
                    ? `"${invalidWords[0]}" is too long for the grid.`
                    : `${invalidWords.length} words are too long for the grid.`}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-3">
              <button
                onClick={generate}
                disabled={isGenerating}
                className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isGenerating ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : 'Regenerate Puzzle'}
              </button>
              <button
                onClick={() => setRunMode(true)}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Play className="w-4 h-4 mr-2" />
                Play Online
              </button>
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Puzzle
              </button>
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isCopied ? (
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                ) : (
                  <Share2 className="w-4 h-4 mr-2" />
                )}
                {isCopied ? 'Copied Link!' : 'Share Configuration'}
              </button>

              <div className="pt-4 border-t border-gray-200 mt-4">
                <a 
                  href="https://github.com/bstag/wordsearch" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Github className="w-4 h-4 mr-1.5" />
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Preview Area */}
        <div className="flex-1 p-8 overflow-auto print:p-0 print:overflow-visible">
          <div className="max-w-4xl mx-auto print:max-w-none print:w-full">
            
            {/* Error Message */}
            {error && (
              <div
                className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-md print:hidden"
                role="alert"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Generation Failed</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Puzzle Header */}
            <div className="mb-8 text-center" style={{ marginBottom: 'var(--print-title-margin)' }}>
              {runMode && (
                <div className="mb-4 flex justify-center print:hidden">
                  <button
                    onClick={() => setRunMode(false)}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Back to Config
                  </button>
                </div>
              )}
              <h1 
                className="text-3xl font-bold text-gray-900 mb-2 uppercase tracking-wider"
                style={{ fontSize: 'var(--print-title-size)' }}
              >
                {title}
              </h1>

              <div className="print:hidden flex justify-center mt-2">
                {!runMode && (
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                  aria-label={showSolution ? "Hide solution in preview" : "Show solution in preview"}
                  aria-pressed={showSolution}
                >
                  {showSolution ? <EyeOff className="w-4 h-4 mr-1.5" /> : <Eye className="w-4 h-4 mr-1.5" />}
                  {showSolution ? "Hide Solution" : "Show Solution"}
                </button>
                )}
              </div>

            </div>

            {/* Grid */}
            {puzzle && (
              <div className="flex justify-center mb-10" style={{ marginBottom: 'var(--print-title-margin)' }}>
                {runMode ? (
                  <PlayablePuzzleGrid
                    grid={puzzle.grid}
                    placedWords={puzzle.placedWords}
                    foundWords={foundWords}
                    onWordFound={handleWordFound}
                  />
                ) : (
                  <PuzzleGrid
                    grid={puzzle.grid}
                    showGridLines={showGridLines}
                    printCellSize={printCellSize}
                    printFontSize={printFontSize}
                    solutionGrid={solutionGrid}
                    highlightSolution={showSolution}
                  />
                )}
              </div>
            )}

            {/* Word Bank */}
            <div className="mt-8" style={{ marginTop: 'var(--print-title-margin)' }}>
              <h2 className="text-lg font-semibold mb-4 border-b border-gray-300 pb-2 print:text-black">Word Bank</h2>
              
              {isOverflowing && (
                <div role="alert" className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm print:hidden flex items-start">
                  <span className="font-bold mr-1">Warning:</span> 
                  This puzzle may be too tall to fit on a single printed page. Try reducing the grid height or the number of words.
                </div>
              )}

              <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 print:grid-cols-4">
                {puzzle?.placedWords.map((item, idx) => (
                  <li 
                    key={idx} 
                    className={`text-sm md:text-base print:text-black ${runMode && foundWords.has(item.word) ? 'line-through text-gray-400' : ''}`}
                    style={{ fontSize: 'var(--print-wordbank-size)' }}
                  >
                    <span className="inline-block w-4 h-4 border border-gray-400 mr-2" style={{ width: '0.8em', height: '0.8em' }}></span>
                    {item.word}
                  </li>
                ))}
              </ul>
              {puzzle?.placedWords.length !== wordsRaw.split(/[\n,]+/).filter(w => w.trim().length > 0).length && (
                 <div role="alert" className="mt-4 text-red-500 text-sm print:hidden">
                   Warning: Some words could not be placed due to space constraints. Try increasing the grid size.
                 </div>
              )}
            </div>

            {/* Footer for Print */}
            <div className="hidden print:block mt-12 text-center text-xs text-gray-400" style={{ marginTop: 'var(--print-title-margin)' }}>
              Generated by WsGen - Developed by StagWare
            </div>

            {/* Answer Key Page */}
            {showAnswerKey && puzzle && (
              <div className="hidden print:block break-before-page mt-8">
                <div className="mb-8 text-center">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 uppercase tracking-wider">Answer Key</h1>
                  <div className="text-sm text-gray-500 mt-2">
                    {title}
                  </div>
                </div>

                <div className="flex justify-center mb-10">
                  <AnswerKeyGrid
                    grid={puzzle.grid}
                    showGridLines={showGridLines}
                    printCellSize={printCellSize}
                    printFontSize={printFontSize}
                    solutionGrid={solutionGrid}
                  />
                </div>
                
                <div className="text-center text-xs text-gray-400">
                   Answer Key for {title}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
