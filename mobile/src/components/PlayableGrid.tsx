import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import type { GeneratedPuzzle, WordLocation } from '@shared/generator';

interface Point {
  x: number;
  y: number;
}

interface PlayableGridProps {
  grid: GeneratedPuzzle['grid'];
  placedWords: WordLocation[];
  foundWords: Set<string>;
  onWordFound: (word: string) => void;
  /** Pixel width available for the whole grid. */
  size: number;
}

// Same eight-colour rotation as the web build, as RN colour literals.
const PALETTE = [
  'transparent',
  '#bbf7d0',
  '#bfdbfe',
  '#fecaca',
  '#fef08a',
  '#e9d5ff',
  '#fbcfe8',
  '#c7d2fe',
  '#fed7aa',
];

/**
 * The eight directions a word can run. Selection snaps to whichever of these
 * best matches the drag, which matters far more with a fingertip than with a
 * mouse: the web build simply rejected any drag that wasn't already exactly on
 * an axis or diagonal.
 */
const DIRECTIONS: Point[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: 1 },
  { x: -1, y: -1 },
];

const Cell = React.memo(
  ({
    char,
    cellSize,
    fontSize,
    selected,
    foundColor,
  }: {
    char: string;
    cellSize: number;
    fontSize: number;
    selected: boolean;
    foundColor: string;
  }) => (
    <View
      style={[
        styles.cell,
        { width: cellSize, height: cellSize },
        foundColor !== 'transparent' && { backgroundColor: foundColor },
        selected && styles.cellSelected,
      ]}
    >
      <Text
        style={[styles.cellText, { fontSize }, selected && styles.cellTextSelected]}
allowFontScaling={false}
      >
        {char}
      </Text>
    </View>
  )
);
Cell.displayName = 'Cell';

export function PlayableGrid({
  grid,
  placedWords,
  foundWords,
  onWordFound,
  size,
}: PlayableGridProps) {
  const [selection, setSelection] = useState<{ start: Point; end: Point } | null>(
    null
  );

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const cellSize = cols > 0 ? Math.floor(size / cols) : 0;
  const fontSize = Math.max(9, Math.floor(cellSize * 0.55));

  // Refs so the PanResponder (created once) always sees current values without
  // being re-created on every render.
  const stateRef = useRef({ cellSize, cols, rows, placedWords, foundWords });
  stateRef.current = { cellSize, cols, rows, placedWords, foundWords };
  const startRef = useRef<Point | null>(null);

  // Pre-computed found-cell colours, carried over from the web implementation:
  // keeps per-cell render cost O(1) instead of O(words) during a drag.
  const foundColors = useMemo(() => {
    const colors = new Uint8Array(rows * cols);
    placedWords.forEach((word, idx) => {
      if (!foundWords.has(word.word)) return;
      const colorIndex = (idx % 8) + 1;
      const dx = Math.sign(word.endX - word.startX);
      const dy = Math.sign(word.endY - word.startY);
      const length =
        Math.max(Math.abs(word.endX - word.startX), Math.abs(word.endY - word.startY)) + 1;
      for (let i = 0; i < length; i++) {
        const index = (word.startY + i * dy) * cols + (word.startX + i * dx);
        if (index >= 0 && index < colors.length) colors[index] = colorIndex;
      }
    });
    return colors;
  }, [placedWords, foundWords, rows, cols]);

  const selectedCells = useMemo(() => {
    const cells = new Uint8Array(rows * cols);
    if (!selection) return cells;
    const { start, end } = selection;
    const dx = Math.sign(end.x - start.x);
    const dy = Math.sign(end.y - start.y);
    const steps = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y));
    for (let i = 0; i <= steps; i++) {
      const index = (start.y + i * dy) * cols + (start.x + i * dx);
      if (index >= 0 && index < cells.length) cells[index] = 1;
    }
    return cells;
  }, [selection, rows, cols]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        // Claim the gesture so a vertical drag selects letters instead of
        // scrolling the page. This replaces the web build's non-passive
        // touchmove preventDefault hack.
        onPanResponderTerminationRequest: () => false,

        onPanResponderGrant: (evt) => {
          const cell = toCell(
            evt.nativeEvent.locationX,
            evt.nativeEvent.locationY,
            stateRef.current
          );
          if (!cell) return;
          startRef.current = cell;
          setSelection({ start: cell, end: cell });
        },

        onPanResponderMove: (evt) => {
          const start = startRef.current;
          if (!start) return;
          const raw = toCell(
            evt.nativeEvent.locationX,
            evt.nativeEvent.locationY,
            stateRef.current,
            /* clampToGrid */ true
          );
          if (!raw) return;
          const end = snapToDirection(
            start,
            raw,
            stateRef.current.cols,
            stateRef.current.rows
          );
          setSelection((prev) => {
            if (prev && prev.end.x === end.x && prev.end.y === end.y) return prev;
            return { start, end };
          });
        },

        onPanResponderRelease: () => {
          const start = startRef.current;
          startRef.current = null;
          setSelection((current) => {
            if (start && current) {
              const match = matchWord(
                start,
                current.end,
                stateRef.current.placedWords,
                stateRef.current.foundWords
              );
              if (match) onWordFound(match);
            }
            return null;
          });
        },

        onPanResponderTerminate: () => {
          startRef.current = null;
          setSelection(null);
        },
      }),
    [onWordFound]
  );

  if (cols === 0) return null;

  return (
    <View
      // box-only routes every touch to this container, so locationX/locationY
      // stay in grid coordinates instead of being relative to a child cell.
      pointerEvents="box-only"
      style={[styles.grid, { width: cellSize * cols }]}
      {...panResponder.panHandlers}
    >
      {grid.map((row, y) => (
        <View key={y} style={styles.row}>
          {row.map((char, x) => {
            const index = y * cols + x;
            return (
              <Cell
                key={x}
                char={char}
                cellSize={cellSize}
                fontSize={fontSize}
                selected={selectedCells[index] === 1}
                foundColor={PALETTE[foundColors[index]]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

/** Pixel offset within the grid -> cell coordinate. */
function toCell(
  px: number,
  py: number,
  state: { cellSize: number; cols: number; rows: number },
  clampToGrid = false
): Point | null {
  const { cellSize, cols, rows } = state;
  if (cellSize <= 0) return null;
  let x = Math.floor(px / cellSize);
  let y = Math.floor(py / cellSize);
  if (clampToGrid) {
    x = Math.min(Math.max(x, 0), cols - 1);
    y = Math.min(Math.max(y, 0), rows - 1);
  } else if (x < 0 || y < 0 || x >= cols || y >= rows) {
    return null;
  }
  return { x, y };
}

/**
 * Projects the drag onto each of the eight legal directions and keeps the best
 * match, so a slightly-off finger drag still selects a clean straight line.
 */
function snapToDirection(
  start: Point,
  raw: Point,
  cols: number,
  rows: number
): Point {
  const dx = raw.x - start.x;
  const dy = raw.y - start.y;
  if (dx === 0 && dy === 0) return start;

  let best = start;
  let bestScore = -Infinity;

  for (const dir of DIRECTIONS) {
    // Unit length matters so diagonals aren't unfairly favoured by raw dot product.
    const norm = Math.hypot(dir.x, dir.y);
    const projection = (dx * dir.x + dy * dir.y) / norm;
    if (projection <= 0) continue;

    let steps = Math.round(projection / norm);
    if (steps === 0) continue;

    // Rounding can push the endpoint past an edge. An out-of-range x would wrap
    // into the next row once flattened to y * cols + x, highlighting the wrong
    // cell, so clip the run to the last in-grid step instead.
    if (dir.x !== 0) {
      const maxX = dir.x > 0 ? cols - 1 - start.x : start.x;
      steps = Math.min(steps, maxX);
    }
    if (dir.y !== 0) {
      const maxY = dir.y > 0 ? rows - 1 - start.y : start.y;
      steps = Math.min(steps, maxY);
    }
    if (steps <= 0) continue;

    const candidate = { x: start.x + dir.x * steps, y: start.y + dir.y * steps };
    // How far the candidate endpoint sits from where the finger actually is.
    const error = Math.hypot(candidate.x - raw.x, candidate.y - raw.y);
    const score = projection - error;
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return best;
}

/** Endpoint pair -> word, accepting either drag direction. */
function matchWord(
  start: Point,
  end: Point,
  placedWords: WordLocation[],
  foundWords: Set<string>
): string | null {
  for (const word of placedWords) {
    if (foundWords.has(word.word)) continue;
    const forward =
      word.startX === start.x &&
      word.startY === start.y &&
      word.endX === end.x &&
      word.endY === end.y;
    const backward =
      word.startX === end.x &&
      word.startY === end.y &&
      word.endX === start.x &&
      word.endY === start.y;
    if (forward || backward) return word.word;
  }
  return null;
}

const styles = StyleSheet.create({
  grid: {
    borderWidth: 2,
    borderColor: '#1f2937',
    backgroundColor: '#ffffff',
    alignSelf: 'center',
  },
  row: { flexDirection: 'row' },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  cellSelected: { backgroundColor: '#6366f1' },
  cellText: { fontWeight: '700', color: '#111827' },
  cellTextSelected: { color: '#ffffff' },
});
