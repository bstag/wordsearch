## 2025-02-13 - Accessible Form Validation
**Learning:** Linking helper text and error messages to form inputs using `aria-describedby` provides critical context for screen reader users, especially when multiple constraints (word count, char count) exist.
**Action:** Always include `aria-describedby` pointing to helper/error IDs on complex inputs, and use `aria-invalid` to programmatically signal error states.
