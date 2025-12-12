## 2025-02-18 - Input Validation for URL-State Apps
**Vulnerability:** Missing input validation in logic layer for parameters derived from URL state (`nuqs`).
**Learning:** Apps relying on URL parameters for state management (like this one using `nuqs`) often rely on UI constraints (sliders, inputs) which can be bypassed by editing the URL directly.
**Prevention:** Always validate configuration objects in the core logic function (e.g., using Zod schemas) before processing, regardless of UI controls.
