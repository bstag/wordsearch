I will build a Next.js application tailored for Vercel deployment that fulfills all your requirements.

## 1. Project Initialization
- Create a new **Next.js** project (App Router, TypeScript).
- Install **Tailwind CSS** for styling.
- Install **lucide-react** for icons.
- Install **nuqs** for easy URL state management (perfect for the "Share" feature).

## 2. Core Logic Implementation (`src/lib/generator.ts`)
- **Grid Generation**: 2D array initialization.
- **Placement Algorithm**:
  - Sort words by length (descending).
  - Retry logic for random coordinates and directions.
  - Collision detection logic.
- **Direction Handling**: Support for Horizontal, Vertical, Diagonal, and Reverse (configurable).
- **Distractor Generator**: Logic to create "misspelled" versions of words (e.g., "APPLE" -> "APPLF") and place them before filling the rest with random letters.

## 3. User Interface (`src/app/page.tsx`)
- **Layout**: Two-column layout (Configuration Sidebar vs. Print Preview).
- **Configuration Panel**:
  - Title Input.
  - Grid Size Controls (Width/Height 15-30).
  - Word List Textarea.
  - Options: Checkboxes for directions, Slider for difficulty (distractor density).
- **Preview Area**:
  - Displays the generated grid.
  - Displays the Word Bank.

## 4. Print Optimization (CSS)
- Use Tailwind's `print:` modifiers.
- **`@media print` behavior**:
  - Hide the Configuration Sidebar, Buttons, and Footer.
  - Ensure the Grid and Word Bank use high-contrast black/white.
  - Set proper page breaks (`break-after-page`) to ensure the puzzle fits nicely on paper.

## 5. State & Sharing
- Implement `useQueryState` (from `nuqs`) to automatically sync the configuration (Title, Words, Settings) to the URL bar.
- This ensures that copying the link preserves the exact puzzle settings.

## 6. Verification
- Verify the placement algorithm (ensure words don't overlap incorrectly).
- Verify the "Misspelled" feature.
- Verify Print View using browser emulation.
