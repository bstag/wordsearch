import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Print from 'expo-print';
import * as Clipboard from 'expo-clipboard';
import { z } from 'zod';
import { generatePuzzle, type GeneratedPuzzle } from '@shared/generator';
import { getRandomDefaultWords } from '@shared/wordPool';
import { BuilderScreen } from './src/screens/BuilderScreen';
import { PlayScreen } from './src/screens/PlayScreen';
import { buildPuzzleHtml } from './src/print/puzzleHtml';
import { usePersistedPuzzle } from './src/state/usePersistedPuzzle';
import { parseWordList, shareUrl } from './src/state/puzzleConfig';

type Mode = 'builder' | 'play';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { config, setConfig, isHydrated, savedGame, saveGame, clearGame } =
    usePersistedPuzzle();

  const [mode, setMode] = useState<Mode>('builder');
  const [puzzle, setPuzzle] = useState<GeneratedPuzzle | null>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareConfirmed, setShareConfirmed] = useState(false);

  // Set once we have adopted a restored game, so the debounce effect below
  // doesn't immediately regenerate over the user's in-progress puzzle.
  const restoredRef = useRef(false);
  const skipNextGenerateRef = useRef(false);

  // Seed a random word list on first launch, matching the web app's behaviour.
  useEffect(() => {
    if (!isHydrated) return;
    if (!config.wordsRaw) {
      setConfig({ wordsRaw: getRandomDefaultWords() });
    }
  }, [isHydrated, config.wordsRaw, setConfig]);

  // Adopt a restored in-progress game before any generation runs.
  useEffect(() => {
    if (!isHydrated || restoredRef.current) return;
    if (savedGame) {
      setPuzzle(savedGame.puzzle);
      setFoundWords(new Set(savedGame.foundWords));
      // The debounce effect fires once on mount; let the restored game stand.
      skipNextGenerateRef.current = true;
    }
    restoredRef.current = true;
  }, [isHydrated, savedGame]);

  const generate = useCallback(() => {
    const wordList = parseWordList(config.wordsRaw);
    if (wordList.length === 0) {
      setPuzzle(null);
      setError(null);
      return;
    }

    setIsGenerating(true);
    setError(null);

    // Yield a frame so the spinner paints before the synchronous generator runs.
    requestAnimationFrame(() => {
      try {
        const result = generatePuzzle({
          width: config.width,
          height: config.height,
          words: wordList,
          allowBackwards: config.allowBackwards,
          allowDiagonals: config.allowDiagonals,
          difficulty: config.difficulty,
        });
        setPuzzle(result);
        setFoundWords(new Set());
        // Deliberately does NOT clear the saved game. Config edits auto-
        // regenerate on a debounce, so clearing here silently destroyed an
        // unfinished puzzle the moment the user nudged the grid size. The saved
        // game is only replaced when a different puzzle is actually played.
      } catch (err) {
        if (err instanceof z.ZodError) {
          const messages = err.issues
            .map((issue) => {
              const field = String(issue.path[0] ?? 'configuration');
              return `${field}: ${issue.message}`;
            })
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
    });
  }, [config]);

  // Same 500ms debounce as the web builder. `generate` is the only dependency
  // that may change here: it is keyed to `config`, so config edits reschedule.
  // Crucially `puzzle` must NOT be a dependency — generate() sets it, which
  // would retrigger this effect and regenerate forever.
  useEffect(() => {
    if (!isHydrated || !restoredRef.current) return;
    if (skipNextGenerateRef.current) {
      skipNextGenerateRef.current = false;
      return;
    }

    const timer = setTimeout(generate, 500);
    return () => clearTimeout(timer);
  }, [isHydrated, generate]);

  const handleWordFound = useCallback((word: string) => {
    setFoundWords((prev) => {
      if (prev.has(word)) return prev;
      const next = new Set(prev);
      next.add(word);
      return next;
    });
  }, []);

  const totalWordsIn = (target: GeneratedPuzzle) =>
    new Set(target.placedWords.map((w) => w.word)).size;

  // Checkpoint progress as a plain effect rather than from inside the state
  // updater above, which must stay free of side effects.
  useEffect(() => {
    if (!puzzle || foundWords.size === 0) return;
    const total = totalWordsIn(puzzle);
    if (total > 0 && foundWords.size >= total) {
      // Finished puzzles are not resumable, so drop the checkpoint entirely.
      clearGame();
      return;
    }
    saveGame(puzzle, foundWords, config.title);
  }, [foundWords, puzzle, saveGame, clearGame, config.title]);

  // Surfaced as a Resume card in the builder. Without it the restored game is
  // invisible: the app always opens on the builder, so the only way to discover
  // an unfinished puzzle was to tap Play and notice the checkmarks.
  const resumeInfo = useMemo(() => {
    if (!savedGame) return null;
    const total = totalWordsIn(savedGame.puzzle);
    const found = savedGame.foundWords.length;
    if (found === 0 || total === 0 || found >= total) return null;
    return { title: savedGame.title, found, total };
  }, [savedGame]);

  const handleResume = useCallback(() => {
    if (!savedGame) return;
    setPuzzle(savedGame.puzzle);
    setFoundWords(new Set(savedGame.foundWords));
    setMode('play');
  }, [savedGame]);

  const startPlay = useCallback(() => {
    if (!puzzle) return;
    saveGame(puzzle, foundWords, config.title);
    setMode('play');
  }, [puzzle, foundWords, config.title, saveGame]);

  const handlePlay = useCallback(() => {
    if (!puzzle) return;
    // Playing a different puzzle overwrites the checkpoint, so make that
    // explicit rather than losing someone's half-solved grid to a stray tap.
    const displacesProgress =
      savedGame != null &&
      savedGame.puzzle !== puzzle &&
      savedGame.foundWords.length > 0 &&
      savedGame.foundWords.length < totalWordsIn(savedGame.puzzle);

    if (displacesProgress && savedGame) {
      Alert.alert(
        'Start this puzzle?',
        `"${savedGame.title}" is unfinished (${savedGame.foundWords.length} of ${totalWordsIn(savedGame.puzzle)} found) and will be discarded.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard & Play', style: 'destructive', onPress: startPlay },
        ]
      );
      return;
    }
    startPlay();
  }, [puzzle, savedGame, startPlay]);

  const handlePrint = useCallback(async () => {
    if (!puzzle) return;
    setIsPrinting(true);

    // printAsync can hang forever on Android: observed on the first invocation
    // after a fresh install, where the WebView it renders into starts up but the
    // print dialog never appears and the promise never settles. Without this the
    // button is stuck disabled on "Preparing..." for the rest of the session.
    // Android-only because the docs say it resolves as soon as the dialog shows,
    // whereas on iOS it waits for printing to start and can legitimately be slow.
    const watchdog =
      Platform.OS === 'android'
        ? setTimeout(() => {
            setIsPrinting(false);
            Alert.alert(
              'Print is taking longer than expected',
              'The print dialog did not open. Tap Print / Save PDF to try again.'
            );
          }, 20000)
        : null;

    try {
      await Print.printAsync({ html: buildPuzzleHtml(puzzle, config) });
    } catch (err) {
      // A user-cancelled print dialog rejects on iOS; only surface real failures.
      const message = err instanceof Error ? err.message : String(err);
      if (!/cancel/i.test(message)) {
        Alert.alert('Print failed', message);
      }
    } finally {
      if (watchdog) clearTimeout(watchdog);
      setIsPrinting(false);
    }
  }, [puzzle, config]);

  const handleShare = useCallback(async () => {
    const url = shareUrl(config, true);
    setIsSharing(true);
    try {
      const result = await Share.share(
        Platform.OS === 'ios'
          ? { url, message: config.title }
          : { message: `${config.title}\n${url}` }
      );
      if (result.action === Share.dismissedAction) {
        // Dismissing the sheet still leaves the link within reach.
        await Clipboard.setStringAsync(url);
        setShareConfirmed(true);
        setTimeout(() => setShareConfirmed(false), 2000);
      }
    } catch {
      await Clipboard.setStringAsync(url);
      setShareConfirmed(true);
      setTimeout(() => setShareConfirmed(false), 2000);
    } finally {
      setIsSharing(false);
    }
  }, [config]);

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color="#4f46e5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {mode === 'play' && puzzle ? (
          <PlayScreen
            puzzle={puzzle}
            title={config.title}
            foundWords={foundWords}
            onWordFound={handleWordFound}
            onBack={() => setMode('builder')}
          />
        ) : (
          <BuilderScreen
            config={config}
            setConfig={setConfig}
            puzzle={puzzle}
            isGenerating={isGenerating}
            error={error}
            onRegenerate={generate}
            onPlay={handlePlay}
            resumeInfo={resumeInfo}
            onResume={handleResume}
            onPrint={handlePrint}
            onShare={handleShare}
            isPrinting={isPrinting}
            isSharing={isSharing}
            shareConfirmed={shareConfirmed}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
});
