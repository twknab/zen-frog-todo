# Feature Specification: Notepad Tabs & Grove Row Reveal

**Feature Branch**: `021-notepad-tabs-grove-rows`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "Add renameable, persistent project-style tabs to the markdown notepad (create, rename, reorder, delete; preserve write/preview markdown). Migrate the existing single note into a first tab named \"My Note\". For The Grove, stop horizontal scrolling when history grows large: show only the most recent first row (as many day scenes as fit the width), with a calm \"load more\" control that reveals one additional row at a time; reset to a single row on each visit (short look-back, then back to today)."

## Overview

Two calm refinements to existing surfaces:

1. **Notepad tabs** — The persistent engineering notepad today is a single document. People often juggle notes for different projects or topics. This feature turns that notepad into a small set of **named tabs** they can create, rename, reorder, and delete — each with its own markdown content and the same write / live-preview experience. Existing content migrates into a first tab called **My Note**. People can also bring in a plain markdown file as a new tab.

2. **Grove row reveal** — The Grove currently lays archived days in a horizontal ribbon that scrolls sideways as history grows. For short look-backs, that scroll feels awkward. Instead, show only the **most recent row** that fits the available width, and reveal older days one row at a time via an explicit downward control. Expanded rows reset on each visit — this is a glance, not a long archive browser.

## Clarifications

### Session 2026-07-29

- Q: Can tabs be deleted and reordered? → A: **Yes** — delete and reorder are in scope alongside create, rename, and switch.
- Q: What happens to the existing single notepad document? → A: **Migrate** it into the first tab, named **My Note**.
- Q: How many day scenes per Grove row? → A: As many as **fit the visible width**; each "load more" adds another full row of that same count.
- Q: Do expanded Grove rows persist across visits? → A: **No** — reset to one row on each visit (short-term lookup, then back to today).
- Q: When the viewport resizes while multiple Grove rows are already revealed, what stays constant? → A: **Keep roughly the same count of visible days** — re-slice that set into the new per-row width (day count is the unit of “how much history I’ve opened,” not row count).
- Q: Default name for a newly created tab? → A: **Untitled** — tab is created immediately; user renames when ready (blank/whitespace rename still falls back to Untitled).
- Q: When every Grove day is already visible, what happens to load-more? → A: **Hide** the control entirely — do not leave a disabled control.
- Q: Full import when local notepad tabs already exist? → A: **Merge** — append imported tabs alongside existing ones; on a display-name conflict, rename the *imported* tab to `Name (Version N)` (N = 2, 3, … as needed) so both are kept.
- Q: Import a plain `.md` file (not only full JSON backup)? → A: **In scope** — user can import a markdown file into a new notepad tab; tab name comes from the filename (sans extension); apply the same `Name (Version N)` rule on display-name conflict; new tab becomes active.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Organize engineering notes across named tabs (Priority: P1)

An engineer juggling a few topics opens the notepad and sees their previous content already in a tab named **My Note**. They add another tab (e.g. for a project), rename it, write markdown, switch to live preview, switch tabs, and come back later — names, order, active tab, and content are still there. They can reorder tabs and delete ones they no longer need, without losing the calm write/preview experience.

**Why this priority**: Core value of the notepad half of this feature. A shippable MVP even if Grove changes land later.

**Independent Test**: Open notepad with prior single-document content; confirm it appears under **My Note**; create a second tab, rename it, write and preview markdown, reorder tabs, reload the app, and confirm persistence; delete a non-essential tab and confirm the rest remain.

**Acceptance Scenarios**:

1. **Given** an existing single notepad document from before this feature, **When** the user opens the notepad after upgrade, **Then** that content appears in a first tab titled **My Note**, with write/preview still available.
2. **Given** the notepad is open, **When** the user creates a new tab, **Then** a new empty tab titled **Untitled** appears, becomes active, and can receive markdown.
3. **Given** a tab exists, **When** the user renames it, **Then** the new name is shown on the tab and persists across close/reopen and full page reload.
4. **Given** multiple tabs, **When** the user switches between them, **Then** each shows its own markdown content; write vs live-preview toggle remains available on every tab.
5. **Given** markdown in a tab, **When** the user toggles write ↔ preview, **Then** content is unchanged and preview renders the same calm markdown as today (including rich constructs already supported).
6. **Given** multiple tabs, **When** the user reorders them, **Then** the new order is reflected immediately and persists across reload.
7. **Given** more than one tab, **When** the user deletes a tab, **Then** that tab and its content are removed after a calm confirmation if the tab is non-empty (or immediately if empty), and focus moves to a remaining tab.
8. **Given** only one tab remains, **When** the user attempts to delete it, **Then** deletion is not allowed (at least one tab always remains).
9. **Given** the user selected a particular tab, **When** they close the notepad and reopen (or reload the app), **Then** the same tab is active and all tab names, order, and content are preserved.
10. **Given** a keyboard or screen-reader user, **When** they create, rename, reorder, switch, or delete tabs and toggle write/preview, **Then** all controls are keyboard-operable and labelled; tab changes and mode are announced.
11. **Given** `prefers-reduced-motion` is enabled, **When** they open the notepad or change tabs, **Then** motion is instant or minimal.

---

### User Story 2 - Glance at recent Grove days without sideways scroll (Priority: P1)

A returning user opens the Grove to peek at recent days. They see one calm row of the most recent day scenes — only as many as fit the width — with no horizontal scrollbar. Older days stay out of the way until they choose a gentle "show more" control that reveals the next row. Closing the Grove or leaving and returning shows only the first row again.

**Why this priority**: Directly fixes the stated Grove UX pain; independently valuable even without notepad tabs.

**Independent Test**: With more archived days than fit one row, expand the Grove and confirm only one row shows (newest first, no horizontal scroll); activate load-more once and confirm a second row appears; reload or re-expand after collapse and confirm only one row again.

**Acceptance Scenarios**:

1. **Given** fewer archived days than fit one row, **When** the user views the Grove, **Then** all days appear in a single row with no horizontal scroll and no load-more control.
2. **Given** more archived days than fit one row, **When** the user views the Grove, **Then** only the most recent row is shown (newest first within the row), with no horizontal scrollbar.
3. **Given** more days remain hidden, **When** the user activates the load-more control, **Then** exactly one additional row of days appears below (same count as the first row’s capacity, or fewer if that is all that remain).
4. **Given** all archived days are already revealed, **When** the user looks for load-more, **Then** the control is absent (not merely disabled) so they are not invited to load emptiness.
5. **Given** the user has revealed multiple rows, **When** they leave the Grove (hide it, navigate away, or reload the page) and return, **Then** only the first row is shown again.
6. **Given** the viewport width changes enough to alter how many scenes fit a row, **When** the Grove is visible with one or more rows revealed, **Then** roughly the same number of day scenes stay visible, re-sliced into the new row width, still with no horizontal scroll (if only one row’s worth of days were visible, the single row simply reflows).
7. **Given** a keyboard or screen-reader user, **When** they use load-more and move among day scenes, **Then** the control and scenes are operable and announced; newly revealed days are reachable.
8. **Given** `prefers-reduced-motion` is enabled, **When** a new row is revealed, **Then** the change is instant or minimal (no attention-grabbing animation).

---

### User Story 3 - Take notes with you via export and markdown import (Priority: P2)

An engineer who organized notes across tabs wants them portable. A **full** export includes every tab (name, order, content). Single-day export remains day-scoped and does not embed the ongoing notepad. Importing a full export **merges** tabs in (with Version N on name clashes); an older single-string notepad becomes **My Note**. Separately, they can import any plain markdown file as a new tab — name from the file — so notes from elsewhere land in the notepad without retyping.

**Why this priority**: Constitution Principle III — export/import so the user is never locked in. Additive once tabs exist.

**Independent Test**: With multiple tabs, run a full export and confirm all tabs appear; import that export (and a legacy single-string notepad export) and confirm merge/versioning; import a `.md` file and confirm a new tab with that content; confirm single-day export is unchanged regarding the notepad.

**Acceptance Scenarios**:

1. **Given** multiple notepad tabs exist, **When** the user runs a full export, **Then** the export includes each tab’s name, order, and markdown content (and which tab was active, if that is part of persisted state).
2. **Given** notepad tabs exist, **When** the user exports a single archived day, **Then** that day file remains day-only (no requirement to embed the ongoing notepad).
3. **Given** a full export produced by this feature and local tabs already exist, **When** the user imports it, **Then** imported tabs are appended alongside existing ones; names, order within the imported set, and content are preserved; if an imported tab’s display name already exists locally, that imported tab is renamed to `Name (Version N)` (starting at Version 2) until unique among current tabs; the previously active local tab remains active unless the product already defines a different import focus rule.
4. **Given** an older full export with a single notepad string (pre-tabs), **When** the user imports it, **Then** that content is merged in as a tab titled **My Note**, or **My Note (Version N)** if **My Note** already exists.
5. **Given** the notepad is available, **When** the user imports a plain markdown (`.md`) file, **Then** a new tab is created with the file’s text as its body, titled from the filename without extension (or `Name (Version N)` on conflict), and that tab becomes active with write/preview available.
6. **Given** a non-markdown or unreadable file is chosen for markdown import, **When** import is attempted, **Then** the notepad is unchanged and the user gets a calm, non-alarming explanation (no data loss).

---

### Edge Cases

- Renaming a tab to blank or whitespace → treat as a calm fallback title (**Untitled**), never leave an unlabeled tab.
- Duplicate tab names from normal renaming → allowed; identity is not based on display name alone. Import merge is the exception that auto-versions conflicting *imported* names.
- Import name conflict → imported tab becomes `Name (Version 2)`, then `(Version 3)`, etc., until unique among tabs present after the merge.
- Markdown file import with no usable base name → fall back to **Untitled** (then Version N if needed).
- Very large markdown file → still imported as text into a tab if the browser can read it; if the environment refuses or read fails, show the calm failure path and leave existing tabs untouched.
- Very long tab names → truncated visually in the tab strip with full name available to assistive tech / tooltip as appropriate; content unchanged.
- Deleting the active tab → another remaining tab becomes active (prefer a neighbor).
- Extremely many tabs → tab strip remains usable (scroll or overflow within the notepad chrome only — not a second Grove-style problem); no hard product cap required for v1, but the UI must not break the calm full-screen writing surface.
- Zero archived days → Grove empty/placeholder behavior unchanged; no load-more.
- Exactly one row’s worth of days → no load-more.
- Narrow viewports (e.g. one scene per row) → load-more still reveals one more row (one scene) at a time.
- Viewport resize while multiple rows are revealed → keep approximately the same visible day count and reflow into the new row capacity; do not snap back to one row unless the user leaves and returns (visit reset still applies).
- Grove hide/show preference and day-recap dialog behavior remain as today.

## Requirements *(mandatory)*

### Functional Requirements

**Notepad tabs**

- **FR-001**: System MUST present the persistent engineering notepad as one or more named tabs, each with its own markdown document.
- **FR-002**: System MUST migrate any pre-existing single notepad document into a first tab titled **My Note** without losing content.
- **FR-003**: Users MUST be able to create a new tab (default title **Untitled**), rename a tab, switch tabs, reorder tabs, and delete a tab (except the last remaining tab).
- **FR-004**: System MUST require a calm confirmation before deleting a tab that contains content; empty tabs MAY be deleted without confirmation.
- **FR-005**: System MUST preserve per-tab markdown content, tab names, tab order, and the active tab across notepad close/reopen and full app reload (on-device only).
- **FR-006**: System MUST retain the existing write mode and live rendered markdown preview for every tab (same richness and calm presentation as today’s notepad).
- **FR-007**: System MUST auto-persist edits as the user types (closing never discards), consistent with today’s notepad.
- **FR-008**: Notepad tab UI MUST remain calm and readable — generous spacing, clear active state, no dense chrome that crowds the writing surface (aligns with calm UX / *ma*).
- **FR-009**: Full export MUST include all notepad tabs; single-day export MUST remain free of the ongoing notepad. Import of a full export MUST **merge** imported tabs into the existing collection (append); when an imported tab’s display name conflicts with an existing tab, the imported tab MUST be renamed to `Name (Version N)` (N ≥ 2) until the name is unique. A legacy single-string notepad in an import MUST become a **My Note** tab (or **My Note (Version N)** on conflict).
- **FR-016**: Users MUST be able to import a plain markdown file into the notepad as a **new tab**; the tab body MUST be the file text; the tab title MUST derive from the filename without its extension (fallback **Untitled** if unusable); display-name conflicts MUST use the same `Name (Version N)` rule; the new tab MUST become active. Failed or unsupported picks MUST leave existing tabs unchanged and explain calmly.

**Grove row reveal**

- **FR-010**: When the Grove is shown, the system MUST display archived day scenes newest-first in rows that fit the available width, with **no horizontal scrolling** of the day collection.
- **FR-011**: On each visit to the Grove (initial show after page load, or after the Grove was hidden and shown again), the system MUST show only the first (most recent) row.
- **FR-012**: When more archived days exist beyond the currently revealed set, the system MUST offer a clear, calm control to reveal exactly one additional row of days; when nothing remains to reveal, that control MUST be hidden (not shown disabled).
- **FR-013**: The number of day scenes per row MUST be determined by how many fit the current available width; when width changes, row capacity MUST update so rows still fit without horizontal scroll, and the approximate count of already-revealed day scenes MUST be preserved (re-sliced into the new row layout) rather than resetting to one row mid-visit.
- **FR-014**: Existing Grove behaviors MUST remain: collapse/show preference, Focus Mode hiding, Hyper Minimal empty hiding, day-scene visuals/labels, and day recap on select.
- **FR-015**: All new interactive controls (tabs, rename, reorder, delete, markdown-file import, Grove load-more) MUST be keyboard-operable and screen-reader labelled, and MUST respect `prefers-reduced-motion`.

### Key Entities

- **Notepad tab**: A named markdown document within the persistent notepad; has a stable identity, display name, markdown body, and position in order.
- **Notepad collection**: The ordered set of tabs plus which tab is active; persisted on-device and included in full export/import.
- **Grove row**: A viewport-width-sized slice of archived day scenes (newest first overall); only the first row is shown until the user explicitly reveals more; reveal state is session/visit-scoped, not persisted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After upgrade, 100% of users with a pre-existing notepad see that content under a tab named **My Note** with no manual migration step.
- **SC-002**: A user can create a named second tab, write a short note, switch away and back, and reload the app — and still see the same name and content — in under 2 minutes without documentation.
- **SC-003**: With more archived days than fit one row, viewing the Grove never requires horizontal scrolling of the day collection.
- **SC-004**: Activating load-more once always reveals at most one additional row; after leaving and returning to the Grove, only one row is visible again.
- **SC-005**: Keyboard-only users can complete create/rename/switch/reorder/delete tab and Grove load-more without a pointer.
- **SC-006**: Full export then import into a notepad that already has tabs merges without data loss; name conflicts produce `Name (Version N)` on the imported side; legacy single-notepad exports still import as **My Note** (or versioned).
- **SC-007**: A user can import a plain markdown file into a new active tab (filename-based title, Version N on clash) in under 1 minute; a failed pick leaves existing notes untouched.

## Assumptions

- This extends the existing markdown notepad and Grove; it does not replace Close-the-day reflection or change day-archive semantics.
- Write vs preview is a shared notepad-surface mode (not remembered separately per tab) unless existing behavior already differs — switching tabs does not force a mode change.
- No hard maximum tab count in v1; if the strip overflows, it scrolls within the notepad chrome only.
- Grove "visit" means: page load, and also re-showing the Grove after it was hidden — both reset to one row.
- Row capacity of one is acceptable on very narrow widths; load-more then adds one scene at a time.
- No cloud sync, accounts, or telemetry; persistence remains on-device (localStorage/IndexedDB as already used).
- Deeper Grove pagination, search, or infinite virtualization is out of scope; this row reveal is an intentional simple v1.
- Tab drag-and-drop or explicit reorder controls are both acceptable as long as reorder is achievable and accessible.
- Plain `.md` import is in scope; exporting a single tab as a standalone `.md` file is **not** required for this feature (full JSON export remains the backup path).
- Markdown import accepts common markdown text files the user can pick in the browser; exotic encodings or binary files use the calm failure path.
