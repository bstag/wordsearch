export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ: FaqItem[] = [
  {
    question: 'Is the word search generator free?',
    answer: 'Yes. Creating, playing, printing, and sharing puzzles is free, and there is no account or signup.',
  },
  {
    question: 'How do I make a word search?',
    answer: 'Open the word search maker, type or paste your words (one per line or separated by commas), and pick a grid size and difficulty. The puzzle builds automatically as you type. Use Regenerate Puzzle to shuffle the letters into a new layout.',
  },
  {
    question: 'Can I print a word search with an answer key?',
    answer: 'Yes. Click Print Puzzle and the puzzle prints on the first page with the word bank. With "Include Answer Key" checked, a second page shows the solution with every word highlighted.',
  },
  {
    question: 'How do I play a word search online?',
    answer: 'Click Play Online in the maker, or open any ready-made puzzle. Drag across the letters from the first letter of a word to the last. Found words are highlighted in the grid and crossed off the word bank. It works with a mouse or a touchscreen.',
  },
  {
    question: 'Which directions can words go?',
    answer: 'Words always run across and down. You can also allow diagonal words and backwards words (right to left, bottom to top) to make the puzzle harder.',
  },
  {
    question: 'What does the difficulty setting do?',
    answer: 'Higher difficulty adds decoy words: near-misses of your real words with one letter changed. They make the grid harder to scan because almost-right words pop out at you. At difficulty 0 there are no decoys.',
  },
  {
    question: 'How many words can a puzzle have?',
    answer: 'Up to 100 words, each up to 20 letters, on a grid from 5×5 to 30×30. A word cannot be longer than the grid is wide or tall. If some words do not fit, the maker warns you so you can enlarge the grid.',
  },
  {
    question: 'Can I use words with spaces, numbers, or punctuation?',
    answer: 'Only the letters A to Z go into the grid. Spaces, numbers, and punctuation are removed, so "ice cream" is hidden as ICECREAM.',
  },
  {
    question: 'How do I share a puzzle?',
    answer: 'Click Share Configuration to copy a link. Your title, words, and settings are saved in the link itself, so anyone who opens it gets the same puzzle setup. Sharing from play mode sends them straight to the playable puzzle.',
  },
  {
    question: 'Are my word lists stored anywhere?',
    answer: 'No. Puzzles are generated in your browser, and settings live only in the page link. Nothing is saved to a server.',
  },
  {
    question: 'Is this good for classrooms?',
    answer: 'Yes. Teachers use it for spelling lists, vocabulary review, and early-finisher activities. Paste the week\'s words, print a class set with the answer key, or share a link for students to play on tablets or Chromebooks.',
  },
];
