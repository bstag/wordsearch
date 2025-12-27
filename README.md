# Word Search Generator

A modern, print-optimized Word Search Generator built with Next.js, TypeScript, and Tailwind CSS. Create custom puzzles with configurable difficulty, directions, and instant shareable links.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌟 Features

-   **Dynamic Grid Generation**: Create puzzles from 5x5 up to 30x30.
-   **Smart Placement Algorithm**: Automatically sorts and places words, handling collisions and retries.
-   **Configurable Directions**: Toggle support for:
    -   Horizontal & Vertical
    -   Diagonals
    -   Backwards (Reverse)
-   **Difficulty Slider (Misspelled Distractors)**: Adds "fake" words (e.g., "TIGEK" instead of "TIGER") to increase challenge based on difficulty level.
-   **Print-Optimized**:
    -   **Ink-Saving Mode**: No background colors or heavy borders.
    -   **Auto-Scaling**: Fonts and grids automatically resize to fit A4/Letter pages.
    -   **Smart Layout**: Dynamic margins and word bank sizing to prevent overflow.
    -   **Answer Key**: Automatically generates a second page with the solution (ink-friendly format).
-   **State Sharing**: All settings (title, words, config) are synced to the URL, making puzzles easy to bookmark or share.
-   **Overflow Detection**: Warns you if your word list is too long for the selected grid size.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **State Management**: [nuqs](https://nuqs.47ng.com/) (URL-based state)
-   **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

-   Node.js 18.17+ installed.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/bstag/wordsearch.git
    cd wordsearch
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

### Local Production Preview

Since this project uses `output: 'export'` for static site generation, `npm start` will not work as it expects a server-side runtime. To preview the production build locally:

1.  Build the project:
    ```bash
    npm run build
    ```

2.  Serve the `out` directory:
    ```bash
    npx serve@latest out
    ```

## 🌍 Deployment

### GitHub Pages
This repo is configured with a GitHub Actions workflow to automatically deploy to GitHub Pages.
1.  Go to **Settings > Pages** in your repository.
2.  Under **Build and deployment**, switch Source to **GitHub Actions**.
3.  Push to `main` and the workflow will trigger.

### Vercel
1.  Import this repository into Vercel.
2.  Vercel will automatically detect Next.js.
3.  Deploy! (Vercel automatically handles the static output).

## 📖 Usage Guide

1.  **Configure**: Use the sidebar to set the Title, Grid Size (Width/Height), and Difficulty.
2.  **Add Words**: Type your words into the "Word List" box (separated by commas or newlines).
3.  **Customize**:
    -   Enable/Disable **Backwards** or **Diagonals**.
    -   Toggle **Grid Lines** for visual preference.
    -   Toggle **Answer Key** to include a solution page.
4.  **Print**: Click the **Print Puzzle** button (or Ctrl+P). The sidebar will vanish, and the puzzle will format perfectly for paper.

## 🧩 How it Works

### Placement Algorithm (`src/lib/generator.ts`)
The engine places words longest-to-shortest to maximize fit. It attempts random coordinates and directions (based on your config) up to 100 times per word. If a word cannot fit, it is skipped (and a warning is shown).

### Distractor Logic
The "Difficulty" slider controls the density of "distractor" words. These are misspelled versions of your actual words placed into the grid to trick the solver, before the remaining empty spaces are filled with random letters.

### Print Styling
We use extensive `@media print` CSS overrides to:
-   Hide UI controls.
-   Force high-contrast black & white.
-   Inject dynamic CSS variables (`--print-cell-size`) to scale the grid based on the page size.
-   Force page breaks (`break-before-page`) for the answer key.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
