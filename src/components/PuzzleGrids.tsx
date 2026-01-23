import React from 'react';
import { GeneratedPuzzle } from '@/lib/generator';

interface PuzzleGridProps {
  grid: GeneratedPuzzle['grid'];
  showGridLines: boolean;
  printCellSize: number;
  printFontSize: number;
  solutionGrid?: boolean[][];
  highlightSolution?: boolean;
}

const PuzzleGrid = React.memo(({ grid, showGridLines, printCellSize, printFontSize, solutionGrid, highlightSolution }: PuzzleGridProps) => {
  // ⚡ Performance: Derive width from grid to prevent re-renders when config changes but grid hasn't regenerated yet.
  const gridWidth = grid[0]?.length || 0;

  return (
    <div
      className={`grid bg-white select-none ${showGridLines ? 'border-2 border-black' : ''}`}
      style={{
        gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 1fr))`,
        width: 'fit-content',
      }}
    >
      {grid.map((row, y) => (
        row.map((cell, x) => {
          const isHighlighted = highlightSolution && solutionGrid?.[y]?.[x];
          return (
            <div
              key={`${x}-${y}`}
              className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-lg md:text-xl font-bold uppercase ${showGridLines ? 'border border-gray-300 print:border-gray-800' : ''} ${isHighlighted ? 'bg-yellow-100 text-indigo-700 print:bg-transparent print:text-black' : 'print:text-black'}`}
              style={{
                width: `${printCellSize}px`,
                height: `${printCellSize}px`,
                fontSize: `${printFontSize}px`,
              }}
            >
              {cell}
            </div>
          );
        })
      ))}
    </div>
  );
});

PuzzleGrid.displayName = 'PuzzleGrid';

interface AnswerKeyGridProps {
  grid: GeneratedPuzzle['grid'];
  showGridLines: boolean;
  printCellSize: number;
  printFontSize: number;
  solutionGrid: boolean[][];
}

const AnswerKeyGrid = React.memo(({ grid, showGridLines, printCellSize, printFontSize, solutionGrid }: AnswerKeyGridProps) => {
  // ⚡ Performance: Derive width from grid to prevent re-renders when config changes but grid hasn't regenerated yet.
  const gridWidth = grid[0]?.length || 0;

  return (
    <div
      className={`grid bg-white select-none ${showGridLines ? 'border-2 border-black' : ''}`}
      style={{
        gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 1fr))`,
        width: 'fit-content',
      }}
    >
      {grid.map((row, y) => (
        row.map((cell, x) => {
          const isSolution = solutionGrid?.[y]?.[x];
          return (
            <div
              key={`${x}-${y}`}
              className={`w-9 h-9 flex items-center justify-center text-xl font-bold uppercase ${showGridLines ? 'border border-gray-800' : ''} text-black ${isSolution ? 'print:bg-transparent bg-gray-300' : ''}`}
              style={{
                width: `${printCellSize}px`,
                height: `${printCellSize}px`,
                fontSize: `${printFontSize}px`,
              }}
            >
              <span className={isSolution ? 'text-black font-black print:text-black' : 'text-gray-300 print:text-transparent'}>
                {cell}
              </span>
            </div>
          );
        })
      ))}
    </div>
  );
});

AnswerKeyGrid.displayName = 'AnswerKeyGrid';

export { PuzzleGrid, AnswerKeyGrid };
