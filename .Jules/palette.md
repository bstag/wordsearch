## 2024-03-21 - Instant Form Validation
**Learning:** Users typing configuration values (like lists) benefit from instant inline validation before hitting a "Submit" or "Generate" action. Waiting for a generation failure is frustrating.
**Action:** Implement `useMemo` or effect-based validation for text inputs that have hard constraints (like max length vs grid size) and display warnings immediately with `role="alert"`.

## 2024-05-22 - Semantic Range Inputs
**Learning:** Abstract number ranges (0-10) for difficulty settings lack meaning for users. Adding semantic labels (Easy, Medium, Hard) along with the visual scale clarifies the impact of the setting.
**Action:** When using `input type="range"`, always provide semantic text labels for key values and include them in `aria-valuetext`.

## 2025-02-28 - Play Mode Accessibility Gap
**Learning:** When an application switches modes by replacing the entire UI (e.g., Config -> Play), users lose context immediately. Without a persistent anchor or status region, screen readers have no way to know "where" they are or what the state of the new context is.
**Action:** Always implement a dedicated `role="status"` or `aria-live` region that persists or appears immediately in the new mode to announce current game state and instructions.

## 2025-10-27 - Visual & Semantic State Confirmation
**Learning:** Relying solely on text styles (like `line-through`) to indicate state changes (like "found word") is insufficient for accessibility and visual clarity. Users with low vision or cognitive load benefit from explicit iconography (checkmarks) and screen readers require semantic text (hidden or aria-label).
**Action:** Always pair state-change styles with explicit icons and screen-reader-only text (e.g., "Found") to ensure the status is communicated clearly to all users.
