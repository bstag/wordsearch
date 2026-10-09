import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  AlertCircle,
  Check,
  Dice5,
  Eye,
  EyeOff,
  Play,
  Printer,
  RefreshCw,
  RotateCcw,
  Share2,
  Trash2,
} from 'lucide-react-native';
import type { GeneratedPuzzle } from '@shared/generator';
import { getRandomDefaultWords } from '@shared/wordPool';
import { StaticGrid } from '../components/StaticGrid';
import {
  LIMITS,
  PuzzleConfig,
  findInvalidWords,
  parseWordList,
} from '../state/puzzleConfig';

interface BuilderScreenProps {
  config: PuzzleConfig;
  setConfig: (patch: Partial<PuzzleConfig>) => void;
  puzzle: GeneratedPuzzle | null;
  isGenerating: boolean;
  error: string | null;
  onRegenerate: () => void;
  onPlay: () => void;
  /** Non-null when an unfinished game is checkpointed and worth offering. */
  resumeInfo: { title: string; found: number; total: number } | null;
  onResume: () => void;
  onPrint: () => void;
  onShare: () => void;
  isSharing: boolean;
  isPrinting: boolean;
  shareConfirmed: boolean;
}

const PADDING = 16;

export function BuilderScreen({
  config,
  setConfig,
  puzzle,
  isGenerating,
  error,
  onRegenerate,
  onPlay,
  resumeInfo,
  onResume,
  onPrint,
  onShare,
  isSharing,
  isPrinting,
  shareConfirmed,
}: BuilderScreenProps) {
  const { width } = useWindowDimensions();
  const [showSolution, setShowSolution] = useState(false);
  const gridSize = Math.min(width - PADDING * 2, 480);

  const wordList = useMemo(
    () => parseWordList(config.wordsRaw),
    [config.wordsRaw]
  );
  const invalidWords = useMemo(
    () => findInvalidWords(wordList, config.width, config.height),
    [wordList, config.width, config.height]
  );
  const isWordCountValid = wordList.length <= LIMITS.maxWordCount;
  const blocked = invalidWords.length > 0 || !isWordCountValid;

  const solutionMask = useMemo(() => {
    if (!puzzle) return undefined;
    const cols = puzzle.grid[0]?.length ?? 0;
    const mask = new Uint8Array(puzzle.grid.length * cols);
    puzzle.placedWords.forEach((word) => {
      const dx = Math.sign(word.endX - word.startX);
      const dy = Math.sign(word.endY - word.startY);
      const length =
        Math.max(
          Math.abs(word.endX - word.startX),
          Math.abs(word.endY - word.startY)
        ) + 1;
      for (let i = 0; i < length; i++) {
        const index = (word.startY + i * dy) * cols + (word.startX + i * dx);
        if (index >= 0 && index < mask.length) mask[index] = 1;
      }
    });
    return mask;
  }, [puzzle]);

  const unplacedCount = puzzle
    ? wordList.length - puzzle.placedWords.length
    : 0;

  const difficultyLabel =
    config.difficulty <= 2
      ? 'Easy'
      : config.difficulty <= 5
        ? 'Medium'
        : config.difficulty <= 8
          ? 'Hard'
          : 'Expert';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Word Search</Text>

        {resumeInfo && (
          <TouchableOpacity
            onPress={onResume}
            style={styles.resumeCard}
            accessibilityRole="button"
            accessibilityLabel={`Resume ${resumeInfo.title}, ${resumeInfo.found} of ${resumeInfo.total} words found`}
          >
            <RotateCcw size={20} color="#15803d" />
            <View style={styles.flex}>
              <Text style={styles.resumeTitle} numberOfLines={1}>
                Resume “{resumeInfo.title}”
              </Text>
              <Text style={styles.resumeSubtitle}>
                {resumeInfo.found} of {resumeInfo.total} words found
              </Text>
            </View>
            <Play size={18} color="#15803d" />
          </TouchableOpacity>
        )}

        <Field label="Puzzle Title">
          <TextInput
            value={config.title}
            onChangeText={(title) => setConfig({ title })}
            maxLength={LIMITS.title}
            style={styles.input}
            placeholder="My Word Search"
          />
        </Field>

        <View style={styles.row}>
          <Stepper
            label="Width"
            value={config.width}
            min={LIMITS.gridMin}
            max={LIMITS.gridMax}
            onChange={(width) => setConfig({ width })}
          />
          <Stepper
            label="Height"
            value={config.height}
            min={LIMITS.gridMin}
            max={LIMITS.gridMax}
            onChange={(height) => setConfig({ height })}
          />
        </View>

        <Field label="Directions">
          <Toggle
            label="Allow Backwards"
            value={config.allowBackwards}
            onChange={(allowBackwards) => setConfig({ allowBackwards })}
          />
          <Toggle
            label="Allow Diagonals"
            value={config.allowDiagonals}
            onChange={(allowDiagonals) => setConfig({ allowDiagonals })}
          />
          <Toggle
            label="Show Grid Lines"
            value={config.showGridLines}
            onChange={(showGridLines) => setConfig({ showGridLines })}
          />
          <Toggle
            label="Include Answer Key"
            value={config.showAnswerKey}
            onChange={(showAnswerKey) => setConfig({ showAnswerKey })}
          />
        </Field>

        <Stepper
          label={`Difficulty — ${config.difficulty}/10 (${difficultyLabel})`}
          value={config.difficulty}
          min={LIMITS.difficultyMin}
          max={LIMITS.difficultyMax}
          onChange={(difficulty) => setConfig({ difficulty })}
          wide
        />

        <Field label="Word List">
          <View style={styles.wordListActions}>
            <TouchableOpacity
              onPress={() => config.wordsRaw && setConfig({ wordsRaw: '' })}
              disabled={!config.wordsRaw}
              style={styles.linkButton}
              accessibilityRole="button"
              accessibilityLabel="Clear word list"
            >
              <Trash2 size={13} color={config.wordsRaw ? '#6b7280' : '#d1d5db'} />
              <Text
                style={[
                  styles.linkText,
                  !config.wordsRaw && styles.linkTextDisabled,
                ]}
              >
                Clear
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setConfig({ wordsRaw: getRandomDefaultWords() })}
              style={styles.linkButton}
              accessibilityRole="button"
              accessibilityLabel="Randomize word list"
            >
              <Dice5 size={13} color="#4f46e5" />
              <Text style={[styles.linkText, styles.linkTextAccent]}>Randomize</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            value={config.wordsRaw}
            onChangeText={(wordsRaw) => setConfig({ wordsRaw })}
            maxLength={LIMITS.words}
            multiline
            numberOfLines={6}
            style={[styles.input, styles.textarea, blocked && styles.inputError]}
            placeholder="Enter words separated by commas or newlines"
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <View style={styles.helperRow}>
            <Text style={styles.helper}>
              {wordList.length}/{LIMITS.maxWordCount} words
            </Text>
            <Text style={styles.helper}>
              {config.wordsRaw.length}/{LIMITS.words} chars
            </Text>
          </View>
          {invalidWords.length > 0 && (
            <Text style={styles.errorText}>
              {invalidWords.length === 1
                ? `"${invalidWords[0]}" is too long (max ${Math.min(LIMITS.maxWordLength, Math.max(config.width, config.height))} chars).`
                : `${invalidWords.length} words are too long (max ${Math.min(LIMITS.maxWordLength, Math.max(config.width, config.height))} chars).`}
            </Text>
          )}
          {!isWordCountValid && (
            <Text style={styles.errorText}>
              Too many words ({wordList.length}/{LIMITS.maxWordCount} max).
            </Text>
          )}
        </Field>

        {error && (
          <View style={styles.errorBanner}>
            <AlertCircle size={18} color="#dc2626" />
            <View style={styles.flex}>
              <Text style={styles.errorBannerTitle}>Generation Failed</Text>
              <Text style={styles.errorBannerBody}>{error}</Text>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            label={isGenerating ? 'Generating…' : 'Regenerate Puzzle'}
            icon={<RefreshCw size={16} color="#ffffff" />}
            onPress={onRegenerate}
            disabled={isGenerating || blocked}
            variant="primary"
          />
          <Button
            label="Play"
            icon={<Play size={16} color="#ffffff" />}
            onPress={onPlay}
            disabled={!puzzle || blocked}
            variant="success"
          />
          <Button
            label={isPrinting ? 'Preparing…' : 'Print / Save PDF'}
            icon={<Printer size={16} color="#374151" />}
            onPress={onPrint}
            disabled={!puzzle || blocked || isPrinting}
            variant="outline"
          />
          <Button
            label={
              shareConfirmed ? 'Link Copied!' : isSharing ? 'Sharing…' : 'Share Puzzle'
            }
            icon={
              shareConfirmed ? (
                <Check size={16} color="#16a34a" />
              ) : (
                <Share2 size={16} color="#374151" />
              )
            }
            onPress={onShare}
            disabled={blocked || isSharing}
            variant="outline"
          />
        </View>

        {isGenerating && !puzzle && (
          <ActivityIndicator style={styles.spinner} color="#4f46e5" />
        )}

        {puzzle && (
          <View style={styles.preview}>
            <TouchableOpacity
              onPress={() => setShowSolution((v) => !v)}
              style={styles.linkButton}
              accessibilityRole="button"
            >
              {showSolution ? (
                <EyeOff size={15} color="#4f46e5" />
              ) : (
                <Eye size={15} color="#4f46e5" />
              )}
              <Text style={[styles.linkText, styles.linkTextAccent]}>
                {showSolution ? 'Hide Solution' : 'Show Solution'}
              </Text>
            </TouchableOpacity>

            <View style={styles.gridWrap}>
              <StaticGrid
                grid={puzzle.grid}
                showGridLines={config.showGridLines}
                solutionMask={solutionMask}
                highlightSolution={showSolution}
                size={gridSize}
              />
            </View>

            <Text style={styles.sectionTitle}>Word Bank</Text>
            <View style={styles.wordBank}>
              {puzzle.placedWords.map((item, idx) => (
                <Text key={`${item.word}-${idx}`} style={styles.wordText}>
                  {item.word}
                </Text>
              ))}
            </View>

            {unplacedCount > 0 && (
              <Text style={styles.warningText}>
                {unplacedCount} word{unplacedCount === 1 ? '' : 's'} could not be
                placed. Try increasing the grid size.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: '#818cf8', false: '#d1d5db' }}
        thumbColor={value ? '#4f46e5' : '#f3f4f6'}
      />
    </View>
  );
}

/**
 * Replaces the web build's number inputs and range slider. Steppers avoid both
 * the on-screen numeric keyboard and an extra slider dependency, and they make
 * the 5–30 bounds impossible to violate.
 */
function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  wide = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  wide?: boolean;
}) {
  return (
    <View style={[styles.field, wide ? styles.flex : styles.halfField]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepper}>
        <TouchableOpacity
          onPress={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          style={[styles.stepperButton, value <= min && styles.stepperButtonDisabled]}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
        >
          <Text style={styles.stepperSymbol}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{value}</Text>
        <TouchableOpacity
          onPress={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          style={[styles.stepperButton, value >= max && styles.stepperButtonDisabled]}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
        >
          <Text style={styles.stepperSymbol}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Button({
  label,
  icon,
  onPress,
  disabled,
  variant,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  variant: 'primary' | 'success' | 'outline';
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={[
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'success' && styles.buttonSuccess,
        variant === 'outline' && styles.buttonOutline,
        disabled && styles.buttonDisabled,
      ]}
    >
      {icon}
      <Text
        style={[
          styles.buttonText,
          variant === 'outline' && styles.buttonTextOutline,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: PADDING, paddingBottom: 64 },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  resumeTitle: { fontSize: 15, fontWeight: '600', color: '#14532d' },
  resumeSubtitle: { fontSize: 12, color: '#15803d', marginTop: 2 },
  field: { marginBottom: 18 },
  halfField: { flex: 1 },
  row: { flexDirection: 'row', gap: 12 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  inputError: { borderColor: '#fca5a5' },
  textarea: { minHeight: 120, textAlignVertical: 'top', fontSize: 14 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  toggleLabel: { fontSize: 14, color: '#4b5563' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  stepperButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#f3f4f6',
  },
  stepperButtonDisabled: { opacity: 0.4 },
  stepperSymbol: { fontSize: 18, fontWeight: '700', color: '#374151' },
  stepperValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  wordListActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginBottom: 8,
  },
  linkButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  linkText: { fontSize: 13, color: '#6b7280' },
  linkTextAccent: { color: '#4f46e5', fontWeight: '500' },
  linkTextDisabled: { color: '#d1d5db' },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  helper: { fontSize: 11, color: '#6b7280' },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
    marginTop: 6,
  },
  errorBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
  },
  errorBannerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 2,
  },
  errorBannerBody: { fontSize: 13, color: '#b91c1c' },
  actions: { gap: 10, marginBottom: 24 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonPrimary: { backgroundColor: '#4f46e5' },
  buttonSuccess: { backgroundColor: '#16a34a' },
  buttonOutline: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  buttonTextOutline: { color: '#374151' },
  spinner: { marginVertical: 24 },
  preview: { marginTop: 8 },
  gridWrap: { alignItems: 'center', marginVertical: 16 },
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
  wordText: { width: '50%', fontSize: 14, color: '#111827', paddingVertical: 3 },
  warningText: { marginTop: 12, fontSize: 13, color: '#b45309' },
});
