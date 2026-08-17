import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { GeneratedPuzzle } from '@shared/generator';

interface StaticGridProps {
  grid: GeneratedPuzzle['grid'];
  showGridLines: boolean;
  /** Flat rows*cols mask; 1 marks a cell belonging to a placed word. */
  solutionMask?: Uint8Array;
  highlightSolution?: boolean;
  size: number;
}

const Cell = React.memo(
  ({
    char,
    cellSize,
    fontSize,
    showGridLines,
    highlighted,
  }: {
    char: string;
    cellSize: number;
    fontSize: number;
    showGridLines: boolean;
    highlighted: boolean;
  }) => (
    <View
      style={[
        styles.cell,
        { width: cellSize, height: cellSize },
        showGridLines && styles.cellBordered,
        highlighted && styles.cellHighlighted,
      ]}
    >
      <Text
        style={[styles.cellText, { fontSize }, highlighted && styles.cellTextHighlighted]}
        allowFontScaling={false}
      >
        {char}
      </Text>
    </View>
  )
);
Cell.displayName = 'StaticCell';

export function StaticGrid({
  grid,
  showGridLines,
  solutionMask,
  highlightSolution = false,
  size,
}: StaticGridProps) {
  const cols = grid[0]?.length ?? 0;
  if (cols === 0) return null;

  const cellSize = Math.floor(size / cols);
  const fontSize = Math.max(8, Math.floor(cellSize * 0.55));

  return (
    <View style={[styles.grid, { width: cellSize * cols }]}>
      {grid.map((row, y) => (
        <View key={y} style={styles.row}>
          {row.map((char, x) => (
            <Cell
              key={x}
              char={char}
              cellSize={cellSize}
              fontSize={fontSize}
              showGridLines={showGridLines}
              highlighted={
                highlightSolution && solutionMask?.[y * cols + x] === 1
              }
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    borderWidth: 2,
    borderColor: '#111827',
    backgroundColor: '#ffffff',
    alignSelf: 'center',
  },
  row: { flexDirection: 'row' },
  cell: { alignItems: 'center', justifyContent: 'center' },
  cellBordered: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1d5db',
  },
  cellHighlighted: { backgroundColor: '#fef9c3' },
  cellText: { fontWeight: '700', color: '#111827' },
  cellTextHighlighted: { color: '#4338ca' },
});
