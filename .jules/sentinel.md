## 2025-02-18 - Input Validation for URL-State Apps
**Vulnerability:** Missing input validation in logic layer for parameters derived from URL state (`nuqs`).
**Learning:** Apps relying on URL parameters for state management (like this one using `nuqs`) often rely on UI constraints (sliders, inputs) which can be bypassed by editing the URL directly.
**Prevention:** Always validate configuration objects in the core logic function (e.g., using Zod schemas) before processing, regardless of UI controls.

## 2025-02-18 - CSP for Static Export Apps
**Vulnerability:** Missing Content Security Policy (CSP) in static exports.
**Learning:** `next.config.ts` headers are ignored when `output: 'export'` is set.
**Prevention:** Use a `<meta http-equiv="Content-Security-Policy" ...>` tag in the root layout (or head component) for static deployments like GitHub Pages.

## 2025-02-18 - DoS via Unbounded URL Parameters
**Vulnerability:** URL parameters mapped to state (via `nuqs`) can be arbitrarily long, bypassing UI `maxLength` constraints and causing main-thread freezing (DoS) during processing (e.g., regex splitting).
**Learning:** `nuqs` parsers like `parseAsString` do not enforce length limits by default.
**Prevention:** Use `createParser` to implement custom parsers that enforce length limits or sanitization at the URL parsing layer, ensuring state is always valid/safe before it reaches React components.
