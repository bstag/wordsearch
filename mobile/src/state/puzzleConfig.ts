/**
 * The web app keeps every setting in the URL via nuqs. Phones have no URL bar,
 * so config lives in React state, is persisted to AsyncStorage, and is
 * serialized to the *same* query-string shape for share links. That keeps links
 * interoperable in both directions: a link shared from the app opens the web
 * app, and a web link opens the app via the `wordsearch://` scheme.
 */

export interface PuzzleConfig {
  title: string;
  width: number;
  height: number;
  wordsRaw: string;
  allowBackwards: boolean;
  allowDiagonals: boolean;
  showGridLines: boolean;
  showAnswerKey: boolean;
  difficulty: number;
}

export const DEFAULT_CONFIG: PuzzleConfig = {
  title: 'My Word Search',
  width: 15,
  height: 15,
  wordsRaw: '',
  allowBackwards: true,
  allowDiagonals: true,
  showGridLines: false,
  showAnswerKey: true,
  difficulty: 5,
};

// Mirrors the constraints in WordSearchBuilder.tsx so a hand-edited or hostile
// link can never push the generator outside its Zod schema.
export const LIMITS = {
  title: 100,
  words: 2500,
  gridMin: 5,
  gridMax: 30,
  difficultyMin: 0,
  difficultyMax: 10,
  maxWordCount: 100,
  maxWordLength: 20,
} as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function parseBounded(
  raw: string | undefined,
  min: number,
  max: number,
  fallback: number
): number {
  if (raw == null) return fallback;
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed)) return fallback;
  return clamp(parsed, min, max);
}

function parseBool(raw: string | undefined, fallback: boolean): boolean {
  if (raw == null) return fallback;
  return raw === 'true';
}

/** Query params -> config, applying the same bounds the web parsers enforce. */
export function configFromParams(
  params: Record<string, string | undefined>
): PuzzleConfig {
  const title = params.title?.slice(0, LIMITS.title) ?? DEFAULT_CONFIG.title;
  const wordsRaw =
    params.words?.slice(0, LIMITS.words) ?? DEFAULT_CONFIG.wordsRaw;

  return {
    title,
    wordsRaw,
    width: parseBounded(
      params.width,
      LIMITS.gridMin,
      LIMITS.gridMax,
      DEFAULT_CONFIG.width
    ),
    height: parseBounded(
      params.height,
      LIMITS.gridMin,
      LIMITS.gridMax,
      DEFAULT_CONFIG.height
    ),
    allowBackwards: parseBool(params.backwards, DEFAULT_CONFIG.allowBackwards),
    allowDiagonals: parseBool(params.diagonals, DEFAULT_CONFIG.allowDiagonals),
    showGridLines: parseBool(params.gridLines, DEFAULT_CONFIG.showGridLines),
    showAnswerKey: parseBool(params.answerKey, DEFAULT_CONFIG.showAnswerKey),
    difficulty: parseBounded(
      params.difficulty,
      LIMITS.difficultyMin,
      LIMITS.difficultyMax,
      DEFAULT_CONFIG.difficulty
    ),
  };
}

/** Config -> query string, matching nuqs's serialization exactly. */
export function paramsFromConfig(
  config: PuzzleConfig,
  runMode = false
): string {
  const params: Record<string, string> = {
    title: config.title,
    width: String(config.width),
    height: String(config.height),
    words: config.wordsRaw,
    backwards: String(config.allowBackwards),
    diagonals: String(config.allowDiagonals),
    gridLines: String(config.showGridLines),
    answerKey: String(config.showAnswerKey),
    difficulty: String(config.difficulty),
  };
  if (runMode) params.run = 'true';

  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

export const WEB_APP_ORIGIN = 'https://wordsearch.stagware.com';

/** Share links point at the web app so recipients without the app still play. */
export function shareUrl(config: PuzzleConfig, runMode = false): string {
  return `${WEB_APP_ORIGIN}/?${paramsFromConfig(config, runMode)}`;
}

/** Splits the word list the same way the web builder does. */
export function parseWordList(wordsRaw: string): string[] {
  return wordsRaw
    .split(/[\n,]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

/** Words too long for the grid or the generator schema, mirroring the web app. */
export function findInvalidWords(
  wordList: string[],
  width: number,
  height: number
): string[] {
  const maxLen = Math.min(LIMITS.maxWordLength, Math.max(width, height));
  return wordList.filter((w) => w.length > maxLen);
}
