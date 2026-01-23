## 2024-05-22 - Frontend Optimization
**Learning:** Pre-calculating a solution set for grid lookup in React reduced lookup complexity from O(W*H*Words*Len) to O(1) per cell, speeding up renders by ~20x for the answer key.
**Action:** When iterating over a grid to check inclusion in a collection of paths/shapes, always pre-calculate a Set or 2D array lookup map if the collection doesn't change during the grid render.

## 2024-05-24 - Frontend Stabilization
**Learning:** Passing volatile configuration state (like `width` input) directly to a visualization component (like `PuzzleGrid`) causes expensive re-renders and visual glitches before the new data is actually generated.
**Action:** Decouple preview components from form state. Derive dimensions from the actual data (`grid[0].length`) inside the component, and use the *active* data dimensions (not form state) for calculating dependent props like `printCellSize`. This acts as a natural "debounce" for the heavy rendering parts.

## 2024-05-28 - Micro-optimization: Map vs Array
**Learning:** In a hot loop (word placement retry logic), using a `Map<number, T>` to cache configuration objects keyed by word length was slower than re-calculating the objects. However, using a pre-allocated `Array(21)` for the same cache provided a measurable (~7%) speedup.
**Action:** For caching data keyed by small integers (like word lengths) in performance-critical code, prefer sparse arrays or pre-allocated arrays over `Map` to avoid lookup overhead.

## 2025-02-26 - Rendering Optimization: Set vs Boolean Grid
**Learning:** Replacing `Set<string>` (using "x,y" keys) with a pre-allocated `boolean[][]` grid for coordinate lookups reduced lookup overhead by ~7x during rendering. The cost of string allocation and hashing for every cell in a large grid is significant.
**Action:** For dense grid-based lookups where dimensions are known and limited (e.g., <100x100), prefer `boolean[][]` or flat arrays over `Set<string>` to avoid garbage collection pressure and improve render speed.
