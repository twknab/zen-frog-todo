# Quickstart: Markdown Notepad — Manual Validation

**Feature**: 011-markdown-notepad  
**Prereqs**: Node deps installed (`npm install` after plan adds `marked` + `dompurify`). Dev server: `npm run dev`.

## Gate commands

```bash
npx tsc --noEmit
npm run lint
```

Both must be clean before calling the feature done.

## Scenarios

### 1. Write and preview (US1 / SC-001)

1. Open the dashboard (not Focus Mode).
2. Find the today's-note card (former Close-the-day card).
3. In Write mode, enter:

   ```markdown
   ## Hello
   - one
   - two

   **bold** and `code`
   ```

4. Switch to Preview — headings/lists/emphasis render.
5. Switch back to Write — raw source unchanged.
6. Reload the page — note still present; mode resets to Write.

### 2. Accessibility + reduced motion (FR-013, FR-014, SC-005, SC-006)

1. Keyboard-only: tab to the mode control, switch Write/Preview with keys, tab into the editor and type.
2. Screen reader: mode control announces name + pressed state; preview content is readable.
3. Enable `prefers-reduced-motion` (OS or DevTools) — mode switch has no decorative animation.

### 3. New day archives the note (US2 / SC-003)

1. With a non-empty note, use **Start a new day** (confirm dialog).
2. Live notepad is empty for the new day.
3. Expand The Grove, open the just-archived day — note appears as rendered markdown.
4. Confirm there is no second plain reflection field on the dashboard (SC-007).

### 4. Export includes the note (US3 / SC-004)

1. Archive a day with a distinctive note string (or keep it live).
2. Export that single day and/or full export via Export menu.
3. Open the JSON — `reflection` contains the markdown source for archived day(s) and `live.reflection` for full export when live.

### 5. Safety (FR-012)

1. In Write mode, paste something like `<script>alert(1)</script>` and `[x](javascript:alert(1))`.
2. Switch to Preview — no script execution; dangerous URLs stripped or inert.
3. Raw source in Write mode still shows what you typed (source not corrupted).

### 6. Focus Mode

1. Enter Focus Mode — notepad card is hidden (same as before).
2. Exit Focus Mode — notepad returns with content intact.

### 7. Theme / calm UX (FR-015, FR-017)

1. Light and dark: editor + preview use zen theme tokens (not stock MUI purple/elevation).
2. Empty write placeholder is gentle; no word counts or guilt copy.
