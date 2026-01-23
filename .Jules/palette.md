## 2024-03-21 - Instant Form Validation
**Learning:** Users typing configuration values (like lists) benefit from instant inline validation before hitting a "Submit" or "Generate" action. Waiting for a generation failure is frustrating.
**Action:** Implement `useMemo` or effect-based validation for text inputs that have hard constraints (like max length vs grid size) and display warnings immediately with `role="alert"`.

## 2024-05-22 - Semantic Range Inputs
**Learning:** Abstract number ranges (0-10) for difficulty settings lack meaning for users. Adding semantic labels (Easy, Medium, Hard) along with the visual scale clarifies the impact of the setting.
**Action:** When using `input type="range"`, always provide semantic text labels for key values and include them in `aria-valuetext`.
