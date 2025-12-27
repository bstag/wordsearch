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
  // Actually, standard implementation is: 
  // R: (1,0), D: (0,1), DR: (1,1), UR: (1,-1)
  // If backwards:
  // L: (-1,0), U: (0,-1), UL: (-1,-1), DL: (-1,1)
  
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
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const dir = allDirections[Math.floor(Math.random() * allDirections.length)];

      // Calculate valid start ranges based on direction and word length to avoid out-of-bounds checks
      // x + (len-1)*dx must be in [0, width)
      // if dx = 1: x + len - 1 < width => x < width - len + 1
      // if dx = -1: x - (len - 1) >= 0 => x >= len - 1
      // if dx = 0: x in [0, width)

      let minX = 0, maxX = width;
      if (dir.x === 1) maxX = width - wordLen + 1;
      else if (dir.x === -1) minX = wordLen - 1;

      let minY = 0, maxY = height;
      if (dir.y === 1) maxY = height - wordLen + 1;
      else if (dir.y === -1) minY = wordLen - 1;

      // If word is too long for the grid in this direction
      if (maxX <= minX || maxY <= minY) continue;

      const startX = Math.floor(Math.random() * (maxX - minX)) + minX;
      const startY = Math.floor(Math.random() * (maxY - minY)) + minY;

      // Check collisions
      let valid = true;
      for (let i = 0; i < cleanWord.length; i++) {
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
        for (let i = 0; i < cleanWord.length; i++) {
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
  // Difficulty 0-10. Let's say difficulty * 0.5 * wordCount = number of distractors?
  // Or difficulty determines probability?
  // User said: "slider for Difficulty (which could control how many misspelled distractors are added)"
  // Diff 1 = 10% of words count, Diff 10 = 200% of words count?
  
  const distractorCount = Math.ceil(words.length * (difficulty / 3));

  for (let i = 0; i < distractorCount; i++) {
    const sourceWord = words[Math.floor(Math.random() * words.length)];
    if (!sourceWord || sourceWord.length < 3) continue;
    
    const clean = sourceWord.toUpperCase().replace(/[^A-Z]/g, '');
    const charIndex = Math.floor(Math.random() * clean.length);
    const originalChar = clean[charIndex];
    
    // Pick a random char that is NOT the original char
    let newChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    while (newChar === originalChar) {
      newChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
    
    const distractor = clean.substring(0, charIndex) + newChar + clean.substring(charIndex + 1);
    placeWord(distractor, true);
  }

  // 4. Fill empty spaces
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === '') {
        grid[y][x] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }

  return { grid, placedWords, distractors };
}
