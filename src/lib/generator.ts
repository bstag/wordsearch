import { z } from 'zod';

export type Direction = 'horizontal' | 'vertical' | 'diagonal' | 'reverse';

export const GeneratorConfigSchema = z.object({
  width: z.number().int().min(5).max(50),
  height: z.number().int().min(5).max(50),
  words: z.array(z.string().min(1).max(20)).min(1).max(100),
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

  // Initialize empty grid
  const grid: string[][] = Array(height).fill(null).map(() => Array(width).fill(''));
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

  // Helper to place a word
  // Assumes word is already upper-case and clean (A-Z only)
  const placeWord = (cleanWord: string, isDistractor: boolean): boolean => {
    const maxAttempts = 100;
    const wordLen = cleanWord.length;
    
    // Pre-calculate valid directions and their bounds to avoid redundant checks inside the retry loop
    const validConfigs = [];
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

    if (validConfigs.length === 0) return false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Pick a random valid direction configuration
      const config = validConfigs[Math.floor(Math.random() * validConfigs.length)];
      const { dir, minX, maxX, minY, maxY } = config;

      const startX = Math.floor(Math.random() * (maxX - minX)) + minX;
      const startY = Math.floor(Math.random() * (maxY - minY)) + minY;

      // Check collisions
      let valid = true;
      for (let i = 0; i < wordLen; i++) {
        const x = startX + i * dir.x;
        const y = startY + i * dir.y;
        const cell = grid[y][x];
        if (cell !== '' && cell !== cleanWord[i]) {
          valid = false;
          break;
        }
      }

      if (valid) {
        // Place it
        for (let i = 0; i < wordLen; i++) {
          const x = startX + i * dir.x;
          const y = startY + i * dir.y;
          grid[y][x] = cleanWord[i];
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

  // 1. Sort words by length (longest first)
  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  // 2. Place real words
  sortedWords.forEach(word => {
    const clean = word.toUpperCase().replace(/[^A-Z]/g, '');
    placeWord(clean, false);
  });

  // 3. Generate and place distractors
  const distractorCount = Math.ceil(words.length * (difficulty / 3));

  for (let i = 0; i < distractorCount; i++) {
    const sourceWord = words[Math.floor(Math.random() * words.length)];
    if (!sourceWord || sourceWord.length < 3) continue;
    
    const clean = sourceWord.toUpperCase().replace(/[^A-Z]/g, '');
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

  // 4. Fill empty spaces
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === '') {
        grid[y][x] = ALPHABET[Math.floor(Math.random() * 26)];
      }
    }
  }

  return { grid, placedWords, distractors };
}
