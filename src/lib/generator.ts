export type Direction = 'horizontal' | 'vertical' | 'diagonal' | 'reverse';

export interface GeneratorConfig {
  width: number;
  height: number;
  words: string[];
  allowBackwards: boolean;
  allowDiagonals: boolean;
  difficulty: number; // 0 to 10, controls density of distractors
}

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
  const { width, height, words, allowBackwards, allowDiagonals, difficulty } = config;

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
  const placeWord = (word: string, isDistractor: boolean): boolean => {
    const maxAttempts = 100;
    const cleanWord = word.toUpperCase().replace(/[^A-Z]/g, '');
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const dir = allDirections[Math.floor(Math.random() * allDirections.length)];
      const startX = Math.floor(Math.random() * width);
      const startY = Math.floor(Math.random() * height);

      // Check bounds
      const endX = startX + (cleanWord.length - 1) * dir.x;
      const endY = startY + (cleanWord.length - 1) * dir.y;

      if (endX < 0 || endX >= width || endY < 0 || endY >= height) continue;

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
          endX,
          endY
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
    placeWord(word, false);
  });

  // 3. Generate and place distractors
  // Difficulty 0-10. Let's say difficulty * 0.5 * wordCount = number of distractors?
  // Or difficulty determines probability?
  // User said: "slider for Difficulty (which could control how many misspelled distractors are added)"
  const numDistractors = Math.floor(words.length * (difficulty / 2)); // e.g., 10 words, diff 5 => 25 distractors? Maybe too many.
  // Let's do: Diff 1 = 10% of words count, Diff 10 = 200% of words count?
  // Let's try: numDistractors = Math.ceil(words.length * (difficulty / 5));
  // If words=10, diff=5 => 10 distractors.
  
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
