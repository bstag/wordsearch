## 2024-05-22 - Frontend Optimization
**Learning:** Pre-calculating a solution set for grid lookup in React reduced lookup complexity from O(W*H*Words*Len) to O(1) per cell, speeding up renders by ~20x for the answer key.
**Action:** When iterating over a grid to check inclusion in a collection of paths/shapes, always pre-calculate a Set or 2D array lookup map if the collection doesn't change during the grid render.

## 2024-05-24 - Frontend Stabilization
**Learning:** Passing volatile configuration state (like `width` input) directly to a visualization component (like `PuzzleGrid`) causes expensive re-renders and visual glitches before the new data is actually generated.
**Action:** Decouple preview components from form state. Derive dimensions from the actual data (`grid[0].length`) inside the component, and use the *active* data dimensions (not form state) for calculating dependent props like `printCellSize`. This acts as a natural "debounce" for the heavy rendering parts.
