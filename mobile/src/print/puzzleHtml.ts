import type { GeneratedPuzzle } from '@shared/generator';
import type { PuzzleConfig } from '../state/puzzleConfig';

/**
 * expo-print renders an HTML string, so the web app's print layout ports over
 * almost directly: same A4/Letter sizing maths, same ink-saving rules, same
 * page-break for the answer key. This is the mobile replacement for
 * window.print() plus the `@media print` block in globals.css.
 */

// US Letter in CSS pixels at 96dpi (8.5in x 11in), NOT the 72dpi 612x792 point
// size. Print engines lay out CSS px at 96dpi, so sizing against 612 leaves the
// grid at ~68% of the page width with a dead band down the page.
const PAGE_WIDTH = 816;
const PAGE_HEIGHT = 1056;
const MARGIN = 38; // ~1cm at 96dpi
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CONTENT_HEIGHT = PAGE_HEIGHT - MARGIN * 2;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Marks every cell covered by a placed word, as the web solutionGrid does. */
function buildSolutionMask(puzzle: GeneratedPuzzle): Uint8Array {
  const rows = puzzle.grid.length;
  const cols = puzzle.grid[0]?.length ?? 0;
  const mask = new Uint8Array(rows * cols);

  puzzle.placedWords.forEach((word) => {
    const dx = Math.sign(word.endX - word.startX);
    const dy = Math.sign(word.endY - word.startY);
    const length =
      Math.max(Math.abs(word.endX - word.startX), Math.abs(word.endY - word.startY)) + 1;
    for (let i = 0; i < length; i++) {
      const index = (word.startY + i * dy) * cols + (word.startX + i * dx);
      if (index >= 0 && index < mask.length) mask[index] = 1;
    }
  });
  return mask;
}

interface GridOptions {
  showGridLines: boolean;
  cellSize: number;
  fontSize: number;
  /** When set, solution letters are emphasised and the rest are dimmed. */
  solutionMask?: Uint8Array;
}

function renderGrid(puzzle: GeneratedPuzzle, options: GridOptions): string {
  const { showGridLines, cellSize, fontSize, solutionMask } = options;
  const cols = puzzle.grid[0]?.length ?? 0;

  const rows = puzzle.grid
    .map((row, y) => {
      const cells = row
        .map((char, x) => {
          const isSolution = solutionMask?.[y * cols + x] === 1;
          const cellClass = solutionMask
            ? isSolution
              ? 'cell solution'
              : 'cell dim'
            : 'cell';
          return `<td class="${cellClass}">${escapeHtml(char)}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `
    <table class="grid ${showGridLines ? 'lines' : ''}"
           style="--cell:${cellSize}px; --cell-font:${fontSize}px;">
      <tbody>${rows}</tbody>
    </table>`;
}

function renderWordBank(puzzle: GeneratedPuzzle, fontSize: number): string {
  const items = puzzle.placedWords
    .map((w) => `<li>${escapeHtml(w.word)}</li>`)
    .join('');
  return `
    <h2 class="section-title">Word Bank</h2>
    <ul class="wordbank" style="--wordbank-font:${fontSize}px;">${items}</ul>`;
}

export function buildPuzzleHtml(
  puzzle: GeneratedPuzzle,
  config: PuzzleConfig
): string {
  const cols = puzzle.grid[0]?.length ?? 0;
  const rows = puzzle.grid.length;

  const wordCount = puzzle.placedWords.length;
  const wordBankRows = Math.ceil(wordCount / 4);
  const titleFont = wordCount > 20 ? 24 : 29;

  // Measure the fixed furniture first, then give the grid every remaining pixel.
  // Budgeting the grid as a flat fraction of the page (the obvious approach)
  // leaves a large blank band under the word bank whenever the list is short.
  const wordBankFont = wordCount > 24 ? 11 : 13;
  const TITLE_BLOCK = titleFont + 24;
  const WORDBANK_BLOCK = 34 + wordBankRows * (wordBankFont * 1.6);
  const FOOTER_BLOCK = 42;
  const availableForGrid =
    CONTENT_HEIGHT - TITLE_BLOCK - WORDBANK_BLOCK - FOOTER_BLOCK;

  const cellSize = Math.floor(
    Math.min(CONTENT_WIDTH / cols, availableForGrid / rows)
  );
  const fontSize = Math.max(6, Math.floor(cellSize * 0.62));
  const title = escapeHtml(config.title);

  const answerKey = config.showAnswerKey
    ? `
      <section class="page-break">
        <h1 class="title" style="--title-font:${titleFont}px;">Answer Key</h1>
        <div class="subtitle">${title}</div>
        ${renderGrid(puzzle, {
          showGridLines: config.showGridLines,
          cellSize,
          fontSize,
          solutionMask: buildSolutionMask(puzzle),
        })}
        <div class="footer">Answer Key for ${title}</div>
      </section>`
    : '';

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  @page { size: letter; margin: ${MARGIN}px; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Helvetica, Arial, sans-serif;
    color: #000;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .title {
    font-size: var(--title-font, 22px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    text-align: center;
    margin: 0 0 6px;
  }
  .subtitle {
    text-align: center;
    font-size: 13px;
    color: #555;
    margin-bottom: 18px;
  }
  .grid {
    border-collapse: collapse;
    margin: 0 auto 16px;
    border: 1.5px solid #000;
  }
  .cell {
    width: var(--cell);
    height: var(--cell);
    font-size: var(--cell-font);
    font-weight: 700;
    text-align: center;
    vertical-align: middle;
    text-transform: uppercase;
    padding: 0;
  }
  .grid.lines .cell { border: 0.5px solid #999; }
  /* Ink-saving answer key: solution letters stay black, the rest fade back. */
  .cell.dim { color: #b0b0b0; font-weight: 400; }
  .cell.solution { color: #000; font-weight: 800; }
  .section-title {
    font-size: 16px;
    font-weight: 700;
    border-bottom: 1px solid #999;
    padding-bottom: 5px;
    margin: 0 0 10px;
  }
  .wordbank {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px 12px;
    font-size: var(--wordbank-font, 10px);
  }
  .wordbank li { text-transform: uppercase; }
  .footer {
    margin-top: 24px;
    text-align: center;
    font-size: 11px;
    color: #888;
  }
  .page-break { page-break-before: always; break-before: page; }
</style>
</head>
<body>
  <section>
    <h1 class="title" style="--title-font:${titleFont}px;">${title}</h1>
    ${renderGrid(puzzle, {
      showGridLines: config.showGridLines,
      cellSize,
      fontSize,
    })}
    ${renderWordBank(puzzle, wordBankFont)}
    <div class="footer">Generated by WsGen - Developed by StagWare</div>
  </section>
  ${answerKey}
</body>
</html>`;
}
