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

## 2025-02-28 - Interactive Grid Optimization
**Learning:** In interactive grids, performing geometric checks (like point-on-line segment) for every cell against every object on every render frame (e.g., during drag selection) causes significant lag (O(W*H*N)).
**Action:** Memoize the visual state of the grid into a lookup array (e.g., `string[][]` for classes) dependent only on the data, not the interaction state. This makes the render loop O(1) per cell.

## 2025-03-02 - CSS Variables for List Rendering
**Learning:** Passing dynamic style objects (like `{{ width: size }}`) to thousands of children components in a list/grid creates thousands of new objects per render, forcing React to diff them all.
**Action:** Define a constant style object using CSS variables (e.g., `width: var(--size)`) and update the variables on the parent container. This reduces style prop reconciliation to O(1) (reference equality) and delegates layout updates to the browser's CSS engine.

## 2025-03-03 - Generation Optimization: Uint8Array Buffer
**Learning:** In the core puzzle generation loop, using a standard `string[][]` involved millions of string allocations and pointer dereferences (array of arrays). Switching to a flat `Uint8Array` buffer for the generation phase reduced execution time by ~25% and reduced memory churn.
**Action:** For computationally intensive 2D grid algorithms, use a flat TypedArray (e.g., `Uint8Array`, `Int32Array`) for internal processing and convert to high-level structures (like `string[][]`) only at the IO boundaries.

## 2025-03-05 - Event Handling and State Re-renders
**Learning:** During continuous event listening like drag selection (`touchmove`, `mousemove`), indiscriminately using `document.elementFromPoint` forces expensive synchronous layout checks for every pixel moved. Furthermore, returning a new object reference `{x, y}` from the coordinate parser to a React state updater defeats React's state bail-out optimization (even if the values are logically equal, causing re-renders of the entire 900+ cell grid).
**Action:** When mapping continuous events to a grid structure, use `e.target` directly for mouse events when possible to bypass the hit-test layout calculation. Always pass a functional state updater `setCoord(prev => ...)` to state hooks, checking if the values changed, and return the `prev` identical object reference to allow React to bypass the expensive render cycle completely while hovering in the same cell.
## 2024-03-24 - React.memo on Grid Cells and O(1) Memory Lookups\n**Learning:** In a highly interactive grid component (like PlayablePuzzleGrid), mapping over a 2D array and generating complex DOM nodes on every frame (e.g., during mouse drag) causes significant render lag. Furthermore, using a JavaScript `Set` inside the render loop for active state lookups adds unnecessary object allocation and hash lookup overhead compared to a contiguous `Uint8Array`.\n**Action:** Extract grid items into an isolated, `React.memo` wrapped `<Cell>` component, ensuring only elements with changed props actually re-render. Replace `Set` based lookups with `Uint8Array` index lookups during high-frequency render passes to optimize for contiguous memory cache lines.

## 2025-03-20 - Random Sampling Optimization
**Learning:** Using `Array.prototype.sort(() => 0.5 - Math.random())` to pick a few random items from a large pool is a severe performance anti-pattern. It forces an O(N log N) sort operation over the entire array, generates biased (non-uniform) random distributions in V8, and causes unnecessary memory churn.
**Action:** When picking K random elements from a pool of N items, always use an O(K) partial Fisher-Yates shuffle: randomly pick an index, swap it with the last available element, and pop. This is mathematically uniform and orders of magnitude faster.
