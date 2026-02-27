## 2025-02-13 - Accessible Form Validation
**Learning:** Linking helper text and error messages to form inputs using `aria-describedby` provides critical context for screen reader users, especially when multiple constraints (word count, char count) exist.
**Action:** Always include `aria-describedby` pointing to helper/error IDs on complex inputs, and use `aria-invalid` to programmatically signal error states.

## 2025-02-13 - Focus Management in Conditional Views
**Learning:** When replacing entire views (like Config vs Play Mode), focus is often lost to the body. Using a ref to track intent and restoring focus to the triggering element (or a logical equivalent) preserves keyboard context.
**Action:** Use a `useRef` flag (e.g., `focusOnReturn`) to track when focus restoration is needed, and a callback ref on the target element to programmatically `el.focus()` when re-mounting.
