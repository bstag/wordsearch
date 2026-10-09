import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import type { GeneratedPuzzle } from '@shared/generator';
import {
  DEFAULT_CONFIG,
  PuzzleConfig,
  configFromParams,
} from './puzzleConfig';

const CONFIG_KEY = 'wordsearch:config:v1';
const GAME_KEY = 'wordsearch:game:v1';

interface SavedGame {
  puzzle: GeneratedPuzzle;
  foundWords: string[];
  title: string;
}

/**
 * Restores the last config and any in-progress game on launch. The web app
 * loses your found words on reload because everything lives in the URL; on
 * mobile that would feel broken, so progress is checkpointed to AsyncStorage.
 *
 * An incoming deep link wins over stored state, so tapping a shared puzzle
 * always opens that puzzle.
 */
export function usePersistedPuzzle() {
  const [config, setConfigState] = useState<PuzzleConfig>(DEFAULT_CONFIG);
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      let nextConfig: PuzzleConfig | null = null;
      let nextGame: SavedGame | null = null;

      try {
        const [storedConfig, storedGame] = await AsyncStorage.multiGet([
          CONFIG_KEY,
          GAME_KEY,
        ]);
        if (storedConfig[1]) {
          nextConfig = { ...DEFAULT_CONFIG, ...JSON.parse(storedConfig[1]) };
        }
        if (storedGame[1]) {
          nextGame = JSON.parse(storedGame[1]) as SavedGame;
        }
      } catch {
        // Corrupt or unreadable storage should never block launch; defaults are fine.
      }

      // A deep link describes a specific puzzle, so it overrides stored config
      // and invalidates any half-finished game from a different puzzle.
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          const { queryParams } = Linking.parse(initialUrl);
          if (queryParams && Object.keys(queryParams).length > 0) {
            nextConfig = configFromParams(
              queryParams as Record<string, string | undefined>
            );
            nextGame = null;
          }
        }
      } catch {
        // Malformed link: fall back to whatever we restored above.
      }

      if (cancelled) return;
      if (nextConfig) setConfigState(nextConfig);
      setSavedGame(nextGame);
      hydratedRef.current = true;
      setIsHydrated(true);
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  // getInitialURL() above only covers a cold start. When the app is already
  // running, the OS delivers the link as an event instead, so without this a
  // shared puzzle tapped while the app is open is silently ignored.
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      try {
        const { queryParams } = Linking.parse(url);
        if (!queryParams || Object.keys(queryParams).length === 0) return;
        setConfigState(
          configFromParams(queryParams as Record<string, string | undefined>)
        );
        // The incoming puzzle replaces whatever game was in progress.
        setSavedGame(null);
        AsyncStorage.removeItem(GAME_KEY).catch(() => {});
      } catch {
        // Malformed link: keep the current puzzle rather than blanking it.
      }
    });
    return () => subscription.remove();
  }, []);

  // Persist config changes, but only after hydration so we never write the
  // defaults over real stored state during the first render pass.
  useEffect(() => {
    if (!hydratedRef.current) return;
    AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config)).catch(() => {});
  }, [config]);

  const setConfig = useCallback((patch: Partial<PuzzleConfig>) => {
    setConfigState((prev) => ({ ...prev, ...patch }));
  }, []);

  const saveGame = useCallback(
    (puzzle: GeneratedPuzzle, foundWords: Set<string>, title: string) => {
      const game: SavedGame = {
        puzzle,
        foundWords: Array.from(foundWords),
        title,
      };
      setSavedGame(game);
      AsyncStorage.setItem(GAME_KEY, JSON.stringify(game)).catch(() => {});
    },
    []
  );

  const clearGame = useCallback(() => {
    setSavedGame(null);
    AsyncStorage.removeItem(GAME_KEY).catch(() => {});
  }, []);

  return { config, setConfig, isHydrated, savedGame, saveGame, clearGame };
}
