## 2024-05-22 - Frontend Optimization
**Learning:** Pre-calculating a solution set for grid lookup in React reduced lookup complexity from O(W*H*Words*Len) to O(1) per cell, speeding up renders by ~20x for the answer key.
**Action:** When iterating over a grid to check inclusion in a collection of paths/shapes, always pre-calculate a Set or 2D array lookup map if the collection doesn't change during the grid render.
