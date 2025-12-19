## 2025-02-27 - Inconsistent Form Labeling
**Learning:** Even in modern React apps using advanced state management (nuqs), basic HTML accessibility like linking `label` to `input` via `id` and `htmlFor` is often missed for text/number inputs, while checkboxes often have them (perhaps because of code snippets/examples).
**Action:** Always audit all form fields, not just complex ones, for basic label association.

## 2025-02-27 - Dynamic Warning Accessibility
**Learning:** Status messages that appear dynamically (like form validation warnings) are often ignored by screen readers unless explicitly marked with `role="alert"`. Visual emphasis (colors/borders) is insufficient for AT users.
**Action:** Always add `role="alert"` to conditional warning/error blocks.
