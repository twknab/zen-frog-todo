# Quickstart / Validation: Notepad Tabs & Grove Row Reveal

Manual validation for `021-notepad-tabs-grove-rows`. Gate: clean `tsc --noEmit` + `eslint --max-warnings=0`, plus these checks (incl. reduced-motion + keyboard).

## Prerequisites

```bash
npm install
npm run dev
```

Seed data: at least one existing notepad string in localStorage (pre-upgrade) **or** type notes after load; enough archived days that one row cannot hold them all (or narrow the window).

## A — Legacy migrate → My Note

1. With `frog-garden:notepad-v1` set to a plain JSON string (legacy), reload.
2. Open notepad.
3. **Expect**: one tab **My Note** containing that text; Write/Preview still work.

## B — Tabs CRUD

1. Add tab → **Untitled**, active, empty.
2. Rename to a project name; reload → name persists.
3. Type markdown; Preview → render; Write → source intact.
4. Add a second tab; switch back and forth → bodies isolated.
5. Move left/right → order persists after reload.
6. Delete empty tab → gone immediately; delete non-empty → confirm; last tab cannot delete.
7. Keyboard-only: add, rename, switch, reorder, delete, Write/Preview.

## C — Import / export

1. **Export everything** → JSON `notepad` is a document with `tabs` / `activeTabId`.
2. Import that JSON via notepad import into a notepad that already has tabs → tabs **append**; clashes become `Name (Version N)`; prior active tab stays.
3. Import a legacy export with `"notepad": "hello"` → merges as **My Note** or **My Note (Version N)**.
4. Import `notes.md` → new active tab titled from filename with file body.
5. Import garbage file → calm error; tabs unchanged.
6. Single-day export → still no notepad field.

## D — Grove rows

1. Expand Grove with more days than fit one row.
2. **Expect**: one row, **no** horizontal scroll; load-more visible.
3. Click load-more once → second row; click until exhausted → control **hidden**.
4. Hide Grove, show again → back to one row.
5. Reveal two rows, resize width → roughly same day count, reflowed; still no horizontal scroll.
6. Keyboard: load-more + open a day recap.
7. `prefers-reduced-motion`: reveal without fancy motion.

## E — Regression smoke

- Focus Mode: Grove absent; notepad control still available.
- Hyper Minimal empty Grove: still omitted when empty.
- Reflection / new day: notepad tabs survive; reflection unchanged.
- No network calls for notepad or Grove actions.

## Checklist

- [ ] tsc clean
- [ ] eslint clean
- [ ] A–E scenarios pass
- [ ] Reduced-motion + keyboard pass
