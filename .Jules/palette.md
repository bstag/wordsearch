## 2025-02-27 - Range Input Accessibility
**Learning:** `input[type="range"]` needs `aria-valuetext` to provide context for screen readers, as the raw number value is often meaningless without the scale or unit.
**Action:** Always add `aria-valuetext` (e.g., "5 out of 10") to sliders.

## 2025-02-27 - Checkbox Grouping
**Learning:** Grouping checkboxes with `<div>` and a `label` disconnects the group title from the controls for screen readers. `<fieldset>` with `<legend>` is the semantic standard.
**Action:** Use `<fieldset>` and `<legend>` for groups of related controls.
