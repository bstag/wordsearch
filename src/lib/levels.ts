// Kept apart from themes.ts so the client player can import it without
// pulling every theme's word list into the browser bundle.
export type Level = 'easy' | 'medium' | 'hard';

export const LEVELS: { id: Level; label: string; summary: string }[] = [
  { id: 'easy', label: 'Easy', summary: 'Words run across and down only. No decoys.' },
  { id: 'medium', label: 'Medium', summary: 'Adds diagonal words and a few decoys.' },
  { id: 'hard', label: 'Hard', summary: 'Bigger grid, backwards words, and lots of decoys.' },
];
