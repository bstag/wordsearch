import React, { useCallback, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { ArrowLeft, Check, MousePointerClick, Trophy } from 'lucide-react-native';
import type { GeneratedPuzzle } from '@shared/generator';
import { PlayableGrid } from '../components/PlayableGrid';

interface PlayScreenProps {
  puzzle: GeneratedPuzzle;
  title: string;
  foundWords: Set<string>;
  onWordFound: (word: string) => void;
  onBack: () => void;
}

const GRID_PADDING = 16;

export function PlayScreen({
  puzzle,
  title,
  foundWords,
  onWordFound,
  onBack,
}: PlayScreenProps) {
  const { width } = useWindowDimensions();
  const gridSize = Math.min(width - GRID_PADDING * 2, 520);

  const totalUniqueWords = useMemo(
    () => new Set(puzzle.placedWords.map((w) => w.word)).size,
    [puzzle]
  );
  const isComplete =
    totalUniqueWords > 0 && foundWords.size === totalUniqueWords;

  const handleWordFound = useCallback(
    (word: string) => onWordFound(word),
    [onWordFound]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      // The grid claims its own touches, so scrolling still works everywhere else.
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity
        onPress={onBack}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Back to configuration"
      >
        <ArrowLeft size={18} color="#6b7280" />
        <Text style={styles.backText}>Back to Config</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <View style={[styles.status, isComplete ? styles.statusDone : styles.statusActive]}>
        {isComplete ? (
          <>
            <Trophy size={18} color="#166534" />
            <Text style={styles.statusTextDone}>Puzzle Complete!</Text>
          </>
        ) : (
          <>
            <MousePointerClick size={16} color="#4338ca" />
            <Text style={styles.statusText}>
              Drag to select • Found {foundWords.size} of {totalUniqueWords}
            </Text>
          </>
        )}
      </View>

      <View style={styles.gridWrap}>
        <PlayableGrid
          grid={puzzle.grid}
          placedWords={puzzle.placedWords}
          foundWords={foundWords}
          onWordFound={handleWordFound}
          size={gridSize}
        />
      </View>

      <Text style={styles.sectionTitle}>Word Bank</Text>
      <View style={styles.wordBank}>
        {puzzle.placedWords.map((item, idx) => {
          const found = foundWords.has(item.word);
          return (
            <View key={`${item.word}-${idx}`} style={styles.wordItem}>
              <View style={[styles.checkbox, found && styles.checkboxFound]}>
                {found && <Check size={11} color="#16a34a" strokeWidth={3} />}
              </View>
              <Text style={[styles.wordText, found && styles.wordTextFound]}>
                {item.word}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: GRID_PADDING, paddingBottom: 48 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  backText: { color: '#6b7280', fontSize: 14 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#111827',
    marginBottom: 12,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  statusActive: { backgroundColor: '#eef2ff', borderColor: '#e0e7ff' },
  statusDone: { backgroundColor: '#dcfce7', borderColor: '#bbf7d0' },
  statusText: { color: '#4338ca', fontSize: 13, fontWeight: '500' },
  statusTextDone: { color: '#166534', fontSize: 14, fontWeight: '600' },
  gridWrap: { alignItems: 'center', marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 8,
    marginBottom: 12,
  },
  wordBank: { flexDirection: 'row', flexWrap: 'wrap' },
  wordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '50%',
    paddingVertical: 4,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxFound: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  wordText: { fontSize: 14, color: '#111827' },
  wordTextFound: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
});
