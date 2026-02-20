import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GeneratedPuzzle } from '@/lib/generator';

interface PlayablePuzzleGridProps {
  grid: GeneratedPuzzle['grid'];
  placedWords: GeneratedPuzzle['placedWords'];
  foundWords: Set<string>;
  onWordFound: (word: string) => void;
  printCellSize?: number;
  printFontSize?: number;
}

interface Point {
  x: number;
  y: number;
}

export const PlayablePuzzleGrid = ({
  grid,
  placedWords,
  foundWords,
  onWordFound,
}: PlayablePuzzleGridProps) => {
  const [selectionStart, setSelectionStart] = useState<Point | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Point | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // ⚡ Performance: Pre-calculate found word colors to avoid O(Words * Length) checks per cell on every render.
  // This reduces render complexity from O(W*H * Words) to O(W*H) during interaction.
  const foundColorsGrid = useMemo(() => {
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    const colors = Array(rows).fill(null).map(() => Array(cols).fill(''));

    const palette = [
      'bg-green-200', 'bg-blue-200', 'bg-red-200', 'bg-yellow-200',
      'bg-purple-200', 'bg-pink-200', 'bg-indigo-200', 'bg-orange-200'
    ];

    placedWords.forEach((word, idx) => {
      if (!foundWords.has(word.word)) return;

      const colorClass = palette[idx % palette.length];

      const dx = Math.sign(word.endX - word.startX);
      const dy = Math.sign(word.endY - word.startY);
      const length = Math.max(Math.abs(word.endX - word.startX), Math.abs(word.endY - word.startY)) + 1;

      for (let i = 0; i < length; i++) {
        const x = word.startX + i * dx;
        const y = word.startY + i * dy;
        if (colors[y] && colors[y][x] !== undefined) {
          colors[y][x] = colorClass;
        }
      }
    });

    return colors;
  }, [grid, placedWords, foundWords]);

  // Helper to get cell coordinates from event
  const getCellCoords = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    if (!gridRef.current) return null;
    
    // Handle touch events
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const element = document.elementFromPoint(clientX, clientY);
    if (!element) return null;

    const cell = element.closest('[data-cell-x]');
    if (!cell) return null;

    const x = parseInt(cell.getAttribute('data-cell-x') || '0', 10);
    const y = parseInt(cell.getAttribute('data-cell-y') || '0', 10);
    return { x, y };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default to stop scrolling on touch devices while dragging
    if (e.type === 'touchstart') {
      // We can't prevent default here if we want click events to work, 
      // but for a game we might want to prevent scrolling on the grid.
      // e.preventDefault(); 
    }
    
    const coords = getCellCoords(e);
    if (coords) {
      setSelectionStart(coords);
      setSelectionEnd(coords);
      setIsSelecting(true);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isSelecting || !selectionStart) return;
    
    const coords = getCellCoords(e);
    if (coords) {
      setSelectionEnd(coords);
    }
  };

  const handleEnd = () => {
    if (!isSelecting || !selectionStart || !selectionEnd) {
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      return;
    }

    // Check if the selected line corresponds to a word
    checkSelection(selectionStart, selectionEnd);
    
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const checkSelection = (start: Point, end: Point) => {
    // Check all placed words
    for (const placedWord of placedWords) {
      if (foundWords.has(placedWord.word)) continue;

      // Check forward match
      if (
        placedWord.startX === start.x &&
        placedWord.startY === start.y &&
        placedWord.endX === end.x &&
        placedWord.endY === end.y
      ) {
        onWordFound(placedWord.word);
        return;
      }

      // Check reverse match (user selected backwards)
      if (
        placedWord.startX === end.x &&
        placedWord.startY === end.y &&
        placedWord.endX === start.x &&
        placedWord.endY === start.y
      ) {
        onWordFound(placedWord.word);
        return;
      }
    }
  };

  // ⚡ Performance: Memoize selection set to avoid O(W*H) math checks per frame.
  // Instead of calculating line geometry for every cell, we pre-calculate valid indices once per move.
  const selectedIndices = useMemo(() => {
    const indices = new Set<number>();
    if (!selectionStart || !selectionEnd) return indices;

    const width = grid[0]?.length || 0;
    const dx = selectionEnd.x - selectionStart.x;
    const dy = selectionEnd.y - selectionStart.y;

    // Must be horizontal, vertical, or diagonal
    if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return indices;

    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    const stepX = steps === 0 ? 0 : dx / steps;
    const stepY = steps === 0 ? 0 : dy / steps;

    for (let i = 0; i <= steps; i++) {
      const x = selectionStart.x + (i * stepX);
      const y = selectionStart.y + (i * stepY);
      indices.add(Math.round(y) * width + Math.round(x));
    }

    return indices;
  }, [selectionStart, selectionEnd, grid]);

  // Prevent scrolling when touching the grid
  useEffect(() => {
    const gridEl = gridRef.current;
    if (!gridEl) return;

    const preventDefault = (e: TouchEvent) => {
       if (e.cancelable) e.preventDefault();
    };

    gridEl.addEventListener('touchmove', preventDefault, { passive: false });
    return () => {
      gridEl.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  return (
    <div 
      ref={gridRef}
      className="grid w-full max-w-2xl mx-auto select-none touch-none border-2 border-gray-800 bg-white shadow-lg cursor-pointer"
      style={{
        gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))`,
      }}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      {grid.map((row, y) => {
        const rowOffset = y * (grid[0]?.length || 0);
        return row.map((cell, x) => {
          const selected = selectedIndices.has(rowOffset + x);
          const foundColor = foundColorsGrid[y][x];
          
          return (
            <div
              key={`${x}-${y}`}
              data-cell-x={x}
              data-cell-y={y}
              className={`
                aspect-square w-full
                flex items-center justify-center 
                text-[clamp(0.7rem,4vw,1.5rem)] font-bold uppercase
                border border-gray-200
                transition-colors duration-150
                ${selected ? 'bg-indigo-500 text-white transform scale-105 z-10 shadow-sm' : ''}
                ${!selected && foundColor ? foundColor : ''}
                ${!selected && !foundColor ? 'hover:bg-gray-50' : ''}
              `}
            >
              {cell}
            </div>
          );
        });
      })}
    </div>
  );
};
