# Feature Specification: WYSIWYG Notepad Editor

**Feature Branch**: `022-wysiwyg-notepad`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "Enhance the notepad with a full WYSIWYG rich-text editor while keeping markdown as the raw stored format. Replace the static read-only Preview with a real, live editable rich surface where I can type and build richer documents in real time; still support markdown as raw."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Write rich documents directly, no markdown syntax required (Priority: P1)

A user opens the notepad and, instead of typing markdown symbols and flipping to a read-only preview to see the result, types directly into a formatted, live editing surface: headings look like headings as they type, bold looks bold, lists indent, checkboxes are checkable, links are clickable. They build a richer document in real time without ever needing to know markdown syntax.

**Why this priority**: This is the core of the request — turning the passive preview into an active, rich editing surface. It's the primary value and the feature is not meaningful without it.

**Independent Test**: Open the notepad, switch to the rich editing mode, and confirm you can type formatted content (a heading, some bold text, a bullet list, a checkbox item) and see it rendered live as you type — and that the content is editable, not a static preview.

**Acceptance Scenarios**:

1. **Given** the notepad is open, **When** the user selects the rich editing mode, **Then** a live, editable formatted surface appears (not a static, read-only rendering) and the caret can be placed and text typed directly into it.
2. **Given** the user is in rich editing mode, **When** they apply formatting (e.g. make a line a heading, bold a selection, start a bullet or numbered list, add a checkbox/task item, insert a link, a quote, or a code block), **Then** the formatting is applied and shown live in the surface as they work.
3. **Given** the user has typed rich content in the editing surface, **When** they stop typing, **Then** the content is retained (persisted) exactly as any notepad content is today, with no separate "save" step.

---

### User Story 2 - Keep markdown as the real, portable format (Priority: P1)

A user who relies on markdown (for portability, for pasting into other tools, for the existing export) can still see and edit the raw markdown source, and trusts that everything they write in the rich editor is stored and exported as markdown — not some proprietary format. Switching between the raw-markdown view and the rich view shows the same document either way.

**Why this priority**: Equally essential — the user explicitly requires markdown to remain the raw format. If the rich editor silently changed or corrupted the stored/exported format, it would break portability and the existing export, so this is a hard co-requirement of Story 1, not a nice-to-have.

**Independent Test**: Type content in the rich editor, switch to the raw-markdown view, and confirm the equivalent markdown source is shown and editable; edit the raw markdown, switch back to rich, and confirm the change is reflected. Export the app data and confirm the notepad content is present as markdown.

**Acceptance Scenarios**:

1. **Given** the user has created formatted content in the rich editor, **When** they switch to the raw-markdown view, **Then** they see the equivalent markdown source text, editable.
2. **Given** the user edits the raw markdown source directly, **When** they switch back to the rich editing view, **Then** the rich view reflects those edits (the two views operate on one shared document).
3. **Given** any notepad content (created via either view), **When** the app data is exported, **Then** the notepad content appears in the export as markdown, in the same shape/format as before this feature (the stored format is unchanged).
4. **Given** existing notepad content authored before this feature (free-form markdown), **When** the user opens it in the rich editor, **Then** its meaning is preserved — content is not silently dropped or corrupted [NEEDS CLARIFICATION: for markdown constructs the rich editor does not natively support, should such raw/unsupported markdown be preserved verbatim (round-trips unchanged) or is some loss acceptable — and if loss is possible, how is the user protected from silently losing content?].

---

### User Story 3 - Choose how I work per moment (Priority: P2)

A user fluidly switches between the rich editing surface (for composing and formatting comfortably) and the raw-markdown source (for precise control, quick syntax edits, or pasting markdown from elsewhere), picking whichever suits the moment. The choice of view is remembered sensibly as they move between notepad tabs.

**Why this priority**: The dual-mode workflow is important polish, but the feature's core value (Stories 1 & 2) is deliverable first; this story refines how the two modes coexist and how the toggle behaves.

**Independent Test**: Toggle between rich and raw modes several times with content present, across notepad tabs, and confirm the toggle is obvious, the current mode is clear, and switching never loses content.

**Acceptance Scenarios**:

1. **Given** the notepad's two modes, **When** the user looks at the notepad, **Then** it is clear which mode is active and how to switch, with a control consistent with the app's existing notepad affordances.
2. **Given** the user is working in one mode, **When** they switch notepad tabs and come back, **Then** the mode behaves per the app's established tab/mode convention [NEEDS CLARIFICATION: should the chosen mode (rich vs raw) be shared across all notepad tabs like the current Write/Preview mode is, or remembered per-tab?].
3. **Given** the user switches modes, **When** the switch happens, **Then** it is smooth and does not lose unsaved keystrokes or scroll the user somewhere disorienting.

---

### Edge Cases

- What happens when a user pastes rich content (e.g. copied from a web page or word processor) into the rich editor? It should be captured as sensible formatted content that still round-trips to markdown, rather than raw HTML leaking into the stored markdown.
- What happens with a very large note? The editor must stay responsive; typing latency must not degrade noticeably.
- What happens to markdown features the rich editor doesn't support (see Story 2 clarification) — are they preserved when the document round-trips?
- What happens on first open of the notepad after this feature ships, given the rich editor is a heavier component? Loading it must not slow down the rest of the app's initial load (it should load on demand when the notepad is opened, not before).
- What happens if the rich editor fails to load (e.g. an unusual browser)? The user must still be able to read and edit their notes via the raw-markdown mode — notes are never inaccessible.
- What happens with keyboard-only and screen-reader users? The rich surface and any formatting controls must be fully operable without a mouse and properly announced.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The notepad MUST provide a live, editable rich-text (WYSIWYG) editing surface where formatting is displayed as the user types, replacing the previous static read-only preview.
- **FR-002**: The rich editor MUST support, at minimum, this formatting set: headings, bold, italic, strikethrough, ordered and unordered lists, checkbox/task-list items, links, inline code, fenced code blocks, blockquotes, and horizontal rules. Tables are desirable if they round-trip cleanly. (This bounds scope — an exhaustive editor is explicitly out of scope.)
- **FR-003**: The notepad MUST retain an editable raw-markdown mode; both the rich mode and the raw-markdown mode operate on the same underlying document.
- **FR-004**: Markdown MUST remain the single persisted and exported format for notepad content — the rich editor's internal representation MUST NOT be persisted or change the shape of what is stored in local storage or included in the data export.
- **FR-005**: Switching between the rich mode and the raw-markdown mode MUST show the same content in both directions (rich→raw and raw→rich reflect each other), with no content lost on switch.
- **FR-006**: Content authored in either mode MUST persist automatically using the app's existing notepad persistence, with no new manual save step and no change to the storage key/shape.
- **FR-007**: Pre-existing notepad content (authored as free-form markdown before this feature) MUST open in the rich editor with its meaning preserved, not silently dropped or corrupted (see Story 2 clarification for the handling of unsupported constructs).
- **FR-008**: The feature MUST be entirely client-side — no backend, no network calls, no telemetry; notepad content never leaves the device.
- **FR-009**: The rich editor MUST load on demand (only when the notepad is opened), so it does not increase the app's initial load for users who don't open the notepad.
- **FR-010**: If the rich editor cannot load or initialise, the user MUST still be able to view and edit their notes via the raw-markdown mode (notes are never rendered inaccessible).
- **FR-011**: The rich editor and any formatting controls MUST be fully keyboard-operable and screen-reader labelled, respect reduced-motion preferences, and meet WCAG AA contrast.
- **FR-012**: The rich editor's visual styling MUST match the app's re-themed look (typography, spacing, rounded corners, palette) — no stock/default editor chrome.
- **FR-013**: The formatting controls MUST feel calm and unobtrusive, consistent with the app's tone (no urgency/anxiety UI).
- **FR-014**: The archived-reflection display in the Grove (historical, read-only) is out of scope for editable rich editing and MUST continue to render as it does today [NEEDS CLARIFICATION: confirm the Grove's read-only reflection rendering is unchanged by this feature].

### Key Entities

- **Notepad Document (per tab)**: The content of a notepad tab — already exists and is already stored as a markdown string. This feature does not change what it is or how it is stored; it adds a second, richer way to view and edit it. Markdown remains its canonical form.
- **Editing Mode**: A per-notepad choice of how the current document is presented for editing — rich (WYSIWYG) or raw (markdown source). Both are editable views onto the same Notepad Document; the mode is a UI state, not persisted document data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can produce a formatted document (heading + bold + a list + a checkbox + a link) entirely within the rich editor without typing any markdown symbols, in under 1 minute.
- **SC-002**: 100% of content created in the rich editor is stored and exported as markdown, with the stored/exported format unchanged in shape from before this feature (verified by inspecting exported data).
- **SC-003**: Round-tripping a document (rich → raw → rich, or raw → rich → raw) for the supported formatting set preserves the content with no loss for that supported set.
- **SC-004**: Opening the notepad loads the rich editor on demand; a user who never opens the notepad sees no increase in the app's initial load compared to before this feature.
- **SC-005**: Both editing modes are fully operable with keyboard only and correctly announced by a screen reader, with zero critical accessibility issues.
- **SC-006**: Notes remain accessible for viewing and editing even if the rich editor does not load, verified by simulating a failed/unsupported editor load.

## Assumptions

- The dual-mode model is: the existing raw-markdown "Write" mode is kept (essentially as-is), and the old static read-only "Preview" is replaced by the new live rich (WYSIWYG) editing mode — two editable views of one markdown document. (To be confirmed in clarification; this is the working assumption.)
- The rich editing feature set is scoped to GFM essentials (per FR-002); a fully exhaustive editor (e.g. embeds, footnotes, complex table editing) is out of scope for this iteration (YAGNI).
- Markdown content is the user's own local data; there is no untrusted external content, so the risk surface is limited to keeping the user's own markdown intact and the app free of accidental format corruption.
- No new persisted data shape, storage key, or export schema is introduced — this is an editing-surface enhancement over the existing markdown-string storage.
- The rich editor being a meaningfully heavier component than the current preview is an accepted, explicitly-mitigated cost (loaded on demand), justified by the user's explicit request; this is noted as a divergence-worth-watching against the constitution's bundle-size/simplicity principle rather than a silent addition.
