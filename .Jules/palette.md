## 2025-02-13 - Accessible Form Validation
**Learning:** Linking helper text and error messages to form inputs using `aria-describedby` provides critical context for screen reader users, especially when multiple constraints (word count, char count) exist.
**Action:** Always include `aria-describedby` pointing to helper/error IDs on complex inputs, and use `aria-invalid` to programmatically signal error states.

## 2025-02-13 - Focus Management in Conditional Views
**Learning:** When replacing entire views (like Config vs Play Mode), focus is often lost to the body. Using a ref to track intent and restoring focus to the triggering element (or a logical equivalent) preserves keyboard context.
**Action:** Use a `useRef` flag (e.g., `focusOnReturn`) to track when focus restoration is needed, and a callback ref on the target element to programmatically `el.focus()` when re-mounting.

## 2024-05-18 - Added Empty State for Missing Puzzle
**Learning:** Empty states replacing broken or incomplete UI components are critical for user guidance. In `WordSearchBuilder.tsx`, the Word Bank was previously rendering empty structural elements when no words had been added yet, which feels unpolished.
**Action:** Always wrap conditionally required main content in a conditional block, and provide an explicit empty state component (with an icon and call-to-action) to help users understand what is missing and how to fix it immediately.
## 2024-03-20 - Action Button Accessibility with aria-disabled
**Learning:** Using the native `disabled` attribute on complex action buttons (like Play or Print) removes them from the tab sequence, preventing keyboard and screen reader users from discovering the button or understanding why it is unavailable (e.g., "Fix invalid words to play").
**Action:** For interactive buttons that require specific conditions to be met, use `aria-disabled="true"` combined with an early return in the `onClick` handler, and provide a descriptive `title` (or tooltip) explaining the exact requirement. This ensures the element remains focusable and provides actionable feedback.
