import { generatePuzzle } from '../lib/generator';

const config = {
  width: 15,
  height: 15,
  words: ['APPLE', 'BANANA', 'CHERRY'],
  allowBackwards: true,
  allowDiagonals: true,
  difficulty: 5
};

console.log('Generating puzzle...');
const result = generatePuzzle(config);

console.log('Grid size:', result.grid.length, 'x', result.grid[0].length);
console.log('Placed words:', result.placedWords.map(w => w.word).join(', '));
console.log('Distractors:', result.distractors.map(w => w.word).join(', '));

// Verify all words are placed (might fail if grid is too small, but 15x15 is plenty for these)
if (result.placedWords.length === config.words.length) {
  console.log('SUCCESS: All words placed.');
} else {
  console.error('FAILURE: Not all words placed.');
}

// Verify distractors exist
if (result.distractors.length > 0) {
  console.log(`SUCCESS: ${result.distractors.length} distractors generated.`);
} else {
  console.warn('WARNING: No distractors generated.');
}

// Print grid preview
console.log('Grid preview:');
result.grid.slice(0, 5).forEach(row => console.log(row.join(' ')));
