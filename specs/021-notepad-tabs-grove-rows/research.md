# Research: Notepad Tabs & Grove Row Reveal

**Feature**: `021-notepad-tabs-grove-rows` | **Date**: 2026-07-29

## Decision 1 — Notepad persistence shape

**Decision**: Replace the stored `string` with a small document:

```ts
type NotepadTab = { id: string; title: string; body: string };
type NotepadDocument = { v: 1; tabs: NotepadTab[]; activeTabId: string };
```

Keep storage key `frog-garden:notepad-v1`. On read: if value is a string (or missing), migrate to one tab `{ title: "My Note", body: <string|"\"> }` and write back. If already a document, validate (≥1 tab, activeTabId exists or fall back to first).

**Rationale**: One key, one migration path, matches existing notepad callers; `v` allows future shape bumps without a new key proliferation.

**Alternatives considered**: New `notepad-v2` key (orphans v1 until dual-read — noisier); array-only storage without `activeTabId` (loses FR-005).

## Decision 2 — Tab reorder without a DnD library

**Decision**: Accessible **Move left / Move right** controls on the active (or focused) tab. Pointer users can use the same controls; optional later DnD is out of scope.

**Rationale**: No dependency (YAGNI); keyboard-first satisfies FR-015; calm and explicit.

**Alternatives considered**: `@dnd-kit` / HTML5 drag-only (a11y + bundle cost); long-press menus (heavier chrome).

## Decision 3 — Rename UX

**Decision**: Activate rename via double-click / Enter on the tab (or a quiet edit affordance). Inline text field; commit on Enter/blur; Escape cancels. Blank/whitespace → **Untitled**.

**Rationale**: Matches common tab UIs without a separate dialog; fallback title already in the spec.

**Alternatives considered**: Always-visible edit icon per tab (busier chrome); rename-only via context menu (worse discovery on mobile).

## Decision 4 — Delete confirmation

**Decision**: MUI `Dialog` (re-themed) when `body.trim()` is non-empty; empty tabs delete immediately. Cannot delete when `tabs.length === 1`. After delete, activate a neighbor (prefer next, else previous).

**Rationale**: Spec FR-004 / edge cases; matches existing calm confirm patterns (`NewDayAction`).

## Decision 5 — Export / import scope (critical)

**Decision**:

| Path | Behavior |
|---|---|
| Full export | `notepad` field is `NotepadDocument` (not a bare string). |
| Legacy export read | If `notepad` is a `string`, treat as one **My Note** tab when merging. |
| Import UI | Lives **in the notepad** (file picker): accept `.md` and `.json`. |
| `.md` | New tab; title = filename sans extension (else Untitled); Version N on clash; activate. |
| `.json` with `kind: "full"` | Merge **only** the `notepad` field into the local collection; ignore `archive` / `live` for this feature. |
| Other JSON / unreadable | Calm failure; no mutation. |
| Header Export menu | Unchanged (still export-only). |

**Rationale**: App has **no full-app import today**. Building archive/live restore is a separate product feature. Spec portability for *notes* is satisfied by notepad-scoped merge + `.md` import (Principle III + YAGNI).

**Alternatives considered**: Full garden restore from JSON (large, risky, out of brief); replace-on-import (rejected in clarify); `.md` export of active tab (explicitly not required).

## Decision 6 — Version N title helper

**Decision**: Pure `uniqueTabTitle(desired, existingTitles) → string`. If `desired` free, return it; else try `desired (Version 2)`, `(Version 3)`, … Case-sensitive exact match on display titles. Manual user renames may still duplicate (allowed); auto-version only on import merge.

**Rationale**: Encodes clarify Session answer; keeps identity on `id`, not title.

## Decision 7 — Write / preview mode

**Decision**: Keep mode as **session state inside `MarkdownNotepad`** (default write on mount). Switching tabs does not remount mode unless the editor remounts — prefer **lifting mode to `NotepadShell`** so tab switches preserve write vs preview for the session.

**Rationale**: Spec assumption: shared surface mode; remounting per tab would annoyingly reset to Write.

## Decision 8 — Grove reveal model

**Decision**: Ephemeral `revealedCount` (number of ribbon **items** visible).

- Build ordered `items[]` = optional Today sand column + each archived day column (newest-first archive as today).
- `perRow = max(1, floor((containerWidth + gap) / (itemWidth + gap)))` with `itemWidth` ≈ scene column min (~120px) via constant or measured first child.
- On Grove **visit** (page mount when expanded, or `visible` false→true): `revealedCount = min(items.length, perRow)`.
- Load more: `revealedCount = min(items.length, revealedCount + perRow)`; hide control when `revealedCount >= items.length`.
- Resize: **keep `revealedCount`**, reflow into new `perRow` (spec Option A).
- Layout: CSS flex/grid **wrap**, `overflow-x: hidden` (or visible without scroll). Vertical growth only.

**Rationale**: Day-count preservation matches clarify; item-based math is simpler than tracking “rows” as primary state.

**Alternatives considered**: Persist rows (rejected); keep row-count on resize (rejected); horizontal scroll (status quo — rejected).

## Decision 9 — Today sand and row capacity

**Decision**: Today’s sand peek is **item 0** when present and participates in `revealedCount` / `perRow` like any day column.

**Rationale**: User sees one calm first row including “what’s newest,” not a special always-on exception that reintroduces scroll.

## Decision 10 — Packages / Next docs

**Decision**: No new npm dependencies. Skim App Router client-component notes under `node_modules/next/dist/docs/` before any Next-specific edits (per `AGENTS.md`); this feature is client-component localStorage/UI only.

**Alternatives considered**: Adding a DnD or virtualization library — unnecessary at Grove scale.
