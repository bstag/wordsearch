import React, { useState, useEffect, useRef } from 'react';
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

  // Helper to determine if a cell is part of the current selection line
  const isCellSelected = (x: number, y: number) => {
    if (!selectionStart || !selectionEnd) return false;

    const dx = selectionEnd.x - selectionStart.x;
    const dy = selectionEnd.y - selectionStart.y;

    // Must be horizontal, vertical, or diagonal
    if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return false;

    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    if (steps === 0) return x === selectionStart.x && y === selectionStart.y;

    const stepX = dx / steps;
    const stepY = dy / steps;

    // Check if point (x,y) is on the segment
    // It must satisfy: x = start.x + k * stepX, y = start.y + k * stepY, for 0 <= k <= steps
    
    // Find k based on x (if stepX != 0) or y (if stepY != 0)
    let k;
    if (Math.abs(stepX) > 0) {
      k = (x - selectionStart.x) / stepX;
    } else {
      k = (y - selectionStart.y) / stepY;
    }

    // Check if k is integer (or close enough) and within range
    if (Math.abs(k - Math.round(k)) > 0.001) return false;
    k = Math.round(k);
    
    if (k < 0 || k > steps) return false;

    // Verify the other coordinate matches
    if (Math.abs(stepX) > 0) {
      // Verified x above, check y
      return Math.abs(y - (selectionStart.y + k * stepY)) < 0.001;
    } else {
      // Verified y above, check x
      return Math.abs(x - (selectionStart.x + k * stepX)) < 0.001;
    }
  };

  // Determine if a cell is part of a found word
  const isCellFound = (x: number, y: number) => {
    for (const placedWord of placedWords) {
      if (foundWords.has(placedWord.word)) {
        // Check if point is on this word's line
        const dx = placedWord.endX - placedWord.startX;
        const dy = placedWord.endY - placedWord.startY;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        const stepX = dx / steps;
        const stepY = dy / steps;

        // Check if (x,y) is on this segment
        let k;
        if (Math.abs(stepX) > 0) {
          k = (x - placedWord.startX) / stepX;
        } else {
          k = (y - placedWord.startY) / stepY;
        }

        if (Math.abs(k - Math.round(k)) < 0.001) {
          k = Math.round(k);
          if (k >= 0 && k <= steps) {
             if (Math.abs(stepX) > 0) {
                if (Math.abs(y - (placedWord.startY + k * stepY)) < 0.001) return true;
             } else {
                if (Math.abs(x - (placedWord.startX + k * stepX)) < 0.001) return true;
             }
          }
        }
      }
    }
    return false;
  };
  
  // Helper to determine the color class based on found status
  const getFoundColorClass = (x: number, y: number) => {
     // We could assign different colors to different words if we wanted, 
     // but for now let's just use a standard "found" color.
     // If we want multiple colors, we'd need to return the index of the found word 
     // and map it to a color palette.
     
     // Let's see which word it belongs to (first match)
     let foundIndex = -1;
     placedWords.forEach((word, idx) => {
        if (!foundWords.has(word.word)) return;
        
        const dx = word.endX - word.startX;
        const dy = word.endY - word.startY;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        const stepX = dx / steps;
        const stepY = dy / steps;
        
        let k;
        if (Math.abs(stepX) > 0) {
          k = (x - word.startX) / stepX;
        } else {
          k = (y - word.startY) / stepY;
        }
        
        if (Math.abs(k - Math.round(k)) < 0.001) {
          k = Math.round(k);
          if (k >= 0 && k <= steps) {
             if (Math.abs(stepX) > 0) {
                if (Math.abs(y - (word.startY + k * stepY)) < 0.001) foundIndex = idx;
             } else {
                if (Math.abs(x - (word.startX + k * stepX)) < 0.001) foundIndex = idx;
             }
          }
        }
     });
     
     if (foundIndex === -1) return '';
     
     const colors = [
       'bg-green-200', 'bg-blue-200', 'bg-red-200', 'bg-yellow-200', 
       'bg-purple-200', 'bg-pink-200', 'bg-indigo-200', 'bg-orange-200'
     ];
     return colors[foundIndex % colors.length];
  };

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
      className="inline-grid select-none touch-none border-2 border-gray-800 bg-white shadow-lg cursor-pointer"
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
      {grid.map((row, y) => (
        row.map((cell, x) => {
          const selected = isCellSelected(x, y);
          const foundColor = getFoundColorClass(x, y);
          
          return (
            <div
              key={`${x}-${y}`}
              data-cell-x={x}
              data-cell-y={y}
              className={`
                w-8 h-8 md:w-10 md:h-10 
                flex items-center justify-center 
                text-lg md:text-xl font-bold uppercase
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
        })
      ))}
    </div>
  );
};
