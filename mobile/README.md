# Word Search — Mobile (Expo)

Native iOS/Android build of the [Word Search Generator](../README.md), sharing the
puzzle engine with the Next.js app rather than duplicating it.

## What is shared vs. rewritten

| Concern | Source | Notes |
| --- | --- | --- |
| Puzzle engine | `../src/lib/generator.ts` | Imported verbatim as `@shared/generator` |
| Word pool | `../src/lib/wordPool.ts` | Imported verbatim as `@shared/wordPool` |
| UI | `src/screens`, `src/components` | Rewritten — RN has no CSS grid or Tailwind |
| Config state | `src/state` | Replaces nuqs URL state with AsyncStorage + deep links |
| Print | `src/print/puzzleHtml.ts` | Replaces `window.print()` with an expo-print HTML template |

`metro.config.js` adds `../src/lib` to `watchFolders` so Metro compiles it, and
redirects bare imports made from those files back to this app's `node_modules`
(otherwise `zod` inside `generator.ts` binds to the web app's copy whenever the
web app is installed). `tsconfig.json` mirrors the same mapping for typechecking.

**Editing `src/lib` changes both apps.** That is the point, but it means the web
build is worth re-running after engine changes.

## Running

```bash
npm install
npx expo start
```

Then scan the QR code with Expo Go, or press `a` / `i` for an emulator.

### Android emulator on this machine

The SDK lives at `%LOCALAPPDATA%\Android\Sdk` but is not on `PATH`, and
`sdkmanager` needs JDK 17+ while system Java is 11. Android Studio's bundled
runtime works:

```bash
export ANDROID_HOME="$LOCALAPPDATA/Android/Sdk"
export JAVA_HOME="$PROGRAMFILES/Android/Android Studio/jbr"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
```

The `pixel_10_api_36` AVD (Android 16, Play Store image) is already created. Boot
it with `emulator -avd pixel_10_api_36`, then `npx expo start --android`.

Note: `avdmanager create avd` prints a harmless `Could not load devices from
.../devices.xml` error — the device profile is still applied. Also set
`hw.gpu.enabled=yes` in the AVD's `config.ini`; it is created as `no` and
software rendering is painfully slow.

Typecheck (covers the shared library too):

```bash
npx tsc --noEmit
```

Verify a production bundle:

```bash
npx expo export --platform android --output-dir dist-check
```

## Behaviour differences from the web app

- **Selection snaps.** The web build only accepts a drag that lands exactly on an
  axis or diagonal. Here the drag is projected onto the eight legal directions and
  snapped to the best match, which a fingertip needs and a mouse does not.
- **Progress survives a restart.** Found words and the current grid are
  checkpointed to AsyncStorage. The web app loses them on reload because all state
  lives in the URL.
- **Sliders became steppers.** Avoids a numeric keyboard for grid size and an
  extra slider dependency, and makes the 5–30 bounds unviolatable.
- **Print produces a PDF via the system dialog.** Same layout, sizing maths, and
  ink-saving answer key as the web `@media print` rules.

  Page geometry is in **96dpi CSS pixels** (Letter = 816x1056), not the 72dpi
  612x792 point size. Print engines lay out CSS px at 96dpi, so sizing against
  612 renders the grid at ~68% of the page width with a dead band down the page.

## Share links

Links are generated against `WEB_APP_ORIGIN` in `src/state/puzzleConfig.ts` using
the *same* query parameters nuqs writes, so a link shared from the app opens the
web app and vice versa. Update that constant if the web app moves.

Deep links use the `wordsearch://` scheme declared in `app.json`. To also open
`https://wordsearch.stagware.com` links directly in the app, add an
`associatedDomains` entry (iOS) and an `intentFilters` block (Android), then host
the corresponding `apple-app-site-association` and `assetlinks.json` files.

## Not done yet

- No app icons or splash art beyond the Expo defaults.
- `expo-sharing` is installed but unused; the share flow uses the RN `Share`
  sheet with a clipboard fallback. Drop the dependency or use it to export the
  generated PDF file.
- No saved-puzzle library — only a single in-progress game is retained.
- Verified on the `pixel_10_api_36` emulator (Android 16): generation, drag-select,
  progress persistence across a force-stop, and the two-page print output. Not yet
  run on a physical device, and iOS is entirely unexercised (needs a Mac).
- Deep links verified on the emulator, cold start and warm (app already running).
  Note that Expo Go routes dev links as `exp://<host>:8081/--/?<params>`; the
  `wordsearch://` scheme itself only applies in a standalone or dev build.
- Only **one** in-progress game is retained — there is no library of past puzzles.
  It is surfaced as a Resume card, survives config edits, and prompts before being
  displaced, but starting a second puzzle still ends the first.
