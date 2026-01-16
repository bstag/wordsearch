## 2024-03-21 - Instant Form Validation
**Learning:** Users typing configuration values (like lists) benefit from instant inline validation before hitting a "Submit" or "Generate" action. Waiting for a generation failure is frustrating.
**Action:** Implement `useMemo` or effect-based validation for text inputs that have hard constraints (like max length vs grid size) and display warnings immediately with `role="alert"`.
