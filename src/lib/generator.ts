import { z } from 'zod';

export type Direction = 'horizontal' | 'vertical' | 'diagonal' | 'reverse';

export const GeneratorConfigSchema = z.object({
  width: z.number().int().min(5).max(50),
  height: z.number().int().min(5).max(50),
  words: z.array(z.string().min(1).max(20).regex(/[A-Za-z]/, "Must contain at least one letter")).min(1).max(100),
  allowBackwards: z.boolean(),
  allowDiagonals: z.boolean(),
  difficulty: z.number().int().min(0).max(10)
});

export type GeneratorConfig = z.infer<typeof GeneratorConfigSchema>;

export interface WordLocation {
  word: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface GeneratedPuzzle {
  grid: string[][];
  placedWords: WordLocation[];
  distractors: WordLocation[]; // Just for debug or specialized views, usually not shown
}

const DIRECTIONS = {
  horizontal: { x: 1, y: 0 },
  vertical: { x: 0, y: 1 },
  diagonalDown: { x: 1, y: 1 },
  diagonalUp: { x: 1, y: -1 },
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function generatePuzzle(config: GeneratorConfig): GeneratedPuzzle {
  const validatedConfig = GeneratorConfigSchema.parse(config);
  const { width, height, words, allowBackwards, allowDiagonals, difficulty } = validatedConfig;

  // ⚡ Performance: Use Uint8Array (flat buffer) instead of Array<Array<string>> for generation.
  // This reduces memory allocation and avoids pointer chasing during the hot loop of collision checking.
  // 0 represents empty cell. Char codes (65-90) represent letters.
  const grid = new Uint8Array(width * height);
  const placedWords: WordLocation[] = [];
  const distractors: WordLocation[] = [];

  // Prepare directions
  const directions: { x: number; y: number }[] = [DIRECTIONS.horizontal, DIRECTIONS.vertical];
  if (allowDiagonals) {
    directions.push(DIRECTIONS.diagonalDown, DIRECTIONS.diagonalUp);
  }
  
  // If backwards is allowed, we can flip any of the base directions
  let allDirections = [...directions];
  if (allowBackwards) {
    const backwardDirections = directions.map(d => ({ x: -d.x, y: -d.y }));
    allDirections = [...allDirections, ...backwardDirections];
  }

  // ⚡ Performance: Cache valid direction configs by word length to avoid re-calculation
  const validConfigsCache: { dir: { x: number; y: number }, minX: number, maxX: number, minY: number, maxY: number }[][] = new Array(21);

  // Helper to place a word
  // Assumes word is already upper-case and clean (A-Z only)
  const placeWord = (cleanWord: string, isDistractor: boolean): boolean => {
    const maxAttempts = 100;
    const wordLen = cleanWord.length;
    
    // Check cache first
    let validConfigs = validConfigsCache[wordLen];

    if (!validConfigs) {
      validConfigs = [];
      for (const dir of allDirections) {
        let minX = 0, maxX = width;
        if (dir.x === 1) maxX = width - wordLen + 1;
        else if (dir.x === -1) minX = wordLen - 1;

        let minY = 0, maxY = height;
        if (dir.y === 1) maxY = height - wordLen + 1;
        else if (dir.y === -1) minY = wordLen - 1;

        // Only add direction if the word fits within grid dimensions
        if (maxX > minX && maxY > minY) {
          validConfigs.push({ dir, minX, maxX, minY, maxY });
        }
      }
      validConfigsCache[wordLen] = validConfigs;
    }

    if (validConfigs.length === 0) return false;

    // ⚡ Performance: Convert string to Uint8Array once, outside the loop.
    // This avoids calling charCodeAt() repeated times inside the retry loop.
    const wordCodes = new Uint8Array(wordLen);
    for (let i = 0; i < wordLen; i++) {
      wordCodes[i] = cleanWord.charCodeAt(i);
    }

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Pick a random valid direction configuration
      const config = validConfigs[Math.floor(Math.random() * validConfigs.length)];
      const { dir, minX, maxX, minY, maxY } = config;

      const startX = Math.floor(Math.random() * (maxX - minX)) + minX;
      const startY = Math.floor(Math.random() * (maxY - minY)) + minY;

      // Check collisions
      let valid = true;
      let idx = startY * width + startX;
      const step = dir.y * width + dir.x;

      for (let i = 0; i < wordLen; i++) {
        const cell = grid[idx];
        const charCode = wordCodes[i];
        if (cell !== 0 && cell !== charCode) {
          valid = false;
          break;
        }
        idx += step;
      }

      if (valid) {
        // Place it
        let placementIdx = startY * width + startX;
        for (let i = 0; i < wordLen; i++) {
          grid[placementIdx] = wordCodes[i];
          placementIdx += step;
        }
        
        const location: WordLocation = {
          word: cleanWord,
          startX,
          startY,
          endX: startX + (wordLen - 1) * dir.x,
          endY: startY + (wordLen - 1) * dir.y
        };

        if (isDistractor) {
          distractors.push(location);
        } else {
          placedWords.push(location);
        }
        return true;
      }
    }
    return false;
  };

  // 1. Pre-process words (clean, uppercase, sort)
  // ⚡ Performance: Clean and uppercase all words once at the start.
  // This avoids repetitive regex and string operations during placement and distractor generation.
  const cleanWords = words
    .map(w => w.toUpperCase().replace(/[^A-Z]/g, ''))
    .filter(w => w.length > 0);

  // Sort by length (longest first) for better packing
  const sortedWords = [...cleanWords].sort((a, b) => b.length - a.length);

  // 2. Place real words
  sortedWords.forEach(clean => {
    placeWord(clean, false);
  });

  // 3. Generate and place distractors
  const distractorCount = Math.ceil(words.length * (difficulty / 3));

  // ⚡ Performance: Filter candidates once
  const distractorCandidates = cleanWords.filter(w => w.length >= 3);

  if (distractorCandidates.length > 0) {
    for (let i = 0; i < distractorCount; i++) {
      // Pick random source from pre-cleaned candidates
      const clean = distractorCandidates[Math.floor(Math.random() * distractorCandidates.length)];

      const charIndex = Math.floor(Math.random() * clean.length);
      const originalChar = clean[charIndex];

      // Pick a random char that is NOT the original char
      const originalCharCode = originalChar.charCodeAt(0) - 65;
      const offset = Math.floor(Math.random() * 25) + 1; // 1 to 25
      const newCharCode = (originalCharCode + offset) % 26;
      const newChar = ALPHABET[newCharCode];

      const distractor = clean.substring(0, charIndex) + newChar + clean.substring(charIndex + 1);
      placeWord(distractor, true);
    }
  }

  // 4. Convert flat buffer to string[][] and fill empty spaces
  const finalGrid: string[][] = new Array(height);
  for (let y = 0; y < height; y++) {
    const row = new Array(width);
    const yOffset = y * width;
    for (let x = 0; x < width; x++) {
      const val = grid[yOffset + x];
      if (val === 0) {
        row[x] = ALPHABET[Math.floor(Math.random() * 26)];
      } else {
        row[x] = String.fromCharCode(val);
      }
    }
    finalGrid[y] = row;
  }

  return { grid: finalGrid, placedWords, distractors };
}
