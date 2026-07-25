# Feature Specification: Mobile-First UX

**Feature Branch**: `019-mobile-first-ux`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "Inventory and improve Frog Garden’s mobile web experience so phone users can complete core jobs (designate frog, reorder tasks, open Options, work in Focus/Flow) without desktop-only gestures. Base only on what is already on `main` — exclude Night Camp and any unmerged branch work. Use always-discoverable frog controls, drag-handle reorder that works on touch, full-screen Options on small viewports, safer viewport/safe-area layout, Focus-mode content order that keeps work primary above the fold, and comfortable tap targets. Keep calm, local-first, accessible UX."

## Clarifications

### Session 2026-07-25

- Q: What is in scope for v1? → A: Mobile-first improvements against **current `main` only**. No Night Camp / night-realm work. Do not depend on or include unmerged feature branches.
- Q: How should task reorder work on touch? → A: Visible **drag handles** with a touch-capable reorder interaction (not HTML5 drag-and-drop alone).
- Q: How should Options present on phones? → A: **Full-screen** surface (same family as Notepad), not a clipped Popover.
- Q: What is the git base? → A: Branch from **`main`** only.
- Q: Where is the small vs large viewport cutover? → A: Align with the app’s existing **`md`** responsive tier (phone/tablet below `md` = full-screen Options + Focus stacking rules; `md` and up may keep compact Options).
- Q: Should the frog control stay hover-hidden on desktop? → A: **No** — make it always visible on all viewports (simpler, no hover dependency, calmer discoverability).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Designate today's frog on a phone (Priority: P1)

Someone on a phone in Flow Mode looks at their task list and wants to choose (or change) today's frog. They must see a clear frog control on each incomplete task without needing hover. Tapping it designates that task as the frog, the same as on desktop.

**Why this priority**: Frog designation is the product’s core ritual. Today the control is hover-revealed and effectively invisible on touch devices — a broken primary path.

**Independent Test**: On a narrow touch viewport (or touch emulation) with hover unavailable, open Flow Mode with at least two incomplete tasks; confirm a frog control is visible on each incomplete row; tap one; confirm that task becomes the frog without using a mouse hover.

**Acceptance Scenarios**:

1. **Given** incomplete tasks on a touch-only viewport, **When** the person views the task list without hovering, **Then** each incomplete row shows a discoverable frog-designate control (visible without hover).
2. **Given** an incomplete non-frog task, **When** the person activates its frog control, **Then** that task becomes today's frog and the prior frog (if any) is cleared.
3. **Given** a completed task, **When** the person views its row, **Then** no frog-designate control is offered (same rule as today).

---

### User Story 2 - Reorder tasks with a drag handle on touch (Priority: P1)

Someone on a phone wants to change task order. Each row shows a drag handle. Using that handle, they can reorder tasks with a finger; the new order persists after refresh, matching desktop reorder semantics.

**Why this priority**: Reorder is a stated board behavior, but HTML5 drag-and-drop fails or is unreliable on iOS Safari. Without a touch path, phone users cannot prioritize the list.

**Independent Test**: On a touch viewport with three incomplete tasks, drag via the handle to change order; refresh; confirm order persisted. Keyboard/desktop reorder remains available.

**Acceptance Scenarios**:

1. **Given** multiple incomplete tasks on a touch viewport, **When** the person drags a row using its drag handle, **Then** the list order updates to match the drop position.
2. **Given** a successful reorder, **When** the page is refreshed, **Then** the new order is still present.
3. **Given** Focus Mode with the task list locked/blurred (existing Focus behavior), **When** the person views the list, **Then** reorder is unavailable (handles inert / non-draggable), consistent with current lock rules.
4. **Given** a pointer/mouse desktop viewport, **When** the person reorders via the handle, **Then** reorder still works (no regression to desktop).

---

### User Story 3 - Open Options full-screen on a small phone (Priority: P2)

Someone on a phone opens Options to change palette, appearance, contrast, density, or other settings. The Options surface opens **full-screen**, is fully scrollable, and closes with a clear control — nothing important is clipped off-screen.

**Why this priority**: Options currently opens as a Popover anchored to the header; on short phones the long settings list clips and feels desktop-first.

**Independent Test**: On a ~360×640 viewport, open Options; confirm a full-screen surface; scroll through all sections; change one setting; close; confirm the setting persisted and the dashboard is usable again.

**Acceptance Scenarios**:

1. **Given** a small viewport (phone-width), **When** the person opens Options, **Then** Options occupies a full-screen modal surface with a clear close control.
2. **Given** Options is open on a small viewport, **When** the person scrolls, **Then** every Options section (palette, appearance, contrast, density, and any other existing sections) is reachable without being clipped by the viewport edge.
3. **Given** a large (desktop) viewport, **When** the person opens Options, **Then** Options may remain a compact overlay (Popover/Menu-style) — full-screen is required for small viewports, not mandated for wide desktops.
4. **Given** Options is open, **When** the person dismisses it (close control or Escape), **Then** focus returns sensibly and no settings were applied unintentionally beyond what they changed.

---

### User Story 4 - Comfortable phone chrome and layout (Priority: P2)

Someone opens Frog Garden on a phone. The header does not crush controls into an unusable strip; content respects notches / home indicators; Focus Mode puts the frog (when present) and timer above the bonsai scene so work stays primary; interactive controls are easy to tap.

**Why this priority**: Even with frog + reorder fixed, dense chrome, `100vh` quirks, and Focus stacking bonsai above the frog make the first minutes on mobile feel like a shrunk desktop.

**Independent Test**: Load Flow and Focus on a notched phone-sized viewport; confirm header usability, safe inset padding, Focus order frog→timer→bonsai (when frog card shows), and that primary icon controls meet a comfortable tap size.

**Acceptance Scenarios**:

1. **Given** a phone-width viewport in Flow Mode, **When** the dashboard loads, **Then** mode toggle and header actions remain operable without horizontal page scroll, and brand treatment does not push critical actions off-screen in a way that blocks use.
2. **Given** a phone with safe-area insets (notch / home indicator), **When** the main shell renders, **Then** content and fixed edges respect those insets (no critical control under the home indicator or notch).
3. **Given** Focus Mode with a frog card on a phone-width viewport, **When** the layout renders, **Then** vertical order is frog, then timer, then bonsai (work primary above the garden scene).
4. **Given** primary interactive icon controls in the header and task rows (frog, delete, add, Options, Export, Notepad, sand reset if present), **When** measured for touch, **Then** each offers at least a ~44×44 CSS-pixel comfortable hit target (visual glyph may stay calm/small; hit area may expand).
5. **Given** the main page height, **When** viewed on mobile browsers with dynamic toolbars, **Then** the shell uses a stable mobile viewport height strategy (not a layout that routinely clips the bottom behind the browser chrome).

---

### Edge Cases

- Very narrow widths (~320px): header may wrap or compact (e.g. shorter mode labels) but must remain operable; no horizontal document scroll.
- Landscape phone: Options full-screen and task rows remain usable; drag reorder still works.
- Virtual keyboard open while editing a task title: row controls should not permanently cover the focused field in a way that prevents finishing the edit.
- Reduced motion: chrome transitions for Options open/close and reorder feedback respect `prefers-reduced-motion`; garden/bonsai ambient joy is unchanged by this feature.
- Hyper-minimal / high-contrast modes already on `main`: mobile layout changes must not break those appearances or hide required controls.
- No frog designated: Focus Mode order still places timer before bonsai on small viewports.
- Locked Focus list: drag handles visible or hidden is an implementation choice, but they must not reorder while locked.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On viewports where hover is unavailable, incomplete task rows MUST expose a frog-designate control that is visible without hover.
- **FR-002**: Activating the frog-designate control MUST set that task as today's frog using existing frog semantics (single frog; prior designation cleared).
- **FR-003**: Task rows MUST provide a visible drag handle, and dragging via that handle MUST reorder tasks on both touch and pointer input.
- **FR-004**: Task order changes MUST persist through the existing local tasks storage (same persistence model as today).
- **FR-005**: While the task list is locked (Focus Mode existing behavior), reorder MUST be disabled.
- **FR-006**: On small (phone) viewports, Options MUST open as a full-screen surface with an explicit close control and scrollable content covering all existing Options sections.
- **FR-007**: On large (desktop) viewports, Options MAY keep a compact non-full-screen presentation.
- **FR-008**: Focus Mode on small viewports MUST stack content so that, when the frog card is shown, order is frog → timer → bonsai.
- **FR-009**: The main shell MUST respect device safe-area insets so critical chrome and content are not obscured by notches or home indicators.
- **FR-010**: The main shell MUST use a mobile-stable viewport height approach suitable for dynamic mobile browser chrome (avoid relying solely on classic `100vh` pitfalls).
- **FR-011**: Primary interactive icon controls used in daily mobile flows MUST provide a minimum comfortable touch target of approximately 44×44 CSS pixels.
- **FR-012**: Header chrome on small viewports MUST remain fully operable without requiring horizontal page scrolling.
- **FR-013**: All changes MUST preserve calm, non-judgmental copy and existing accessibility expectations (keyboard operation, accessible names, WCAG AA contrast for chrome).
- **FR-014**: This feature MUST NOT introduce Night Camp, night-realm atmosphere, or any dependency on unmerged branches — scope is `main` only.

### Key Entities

- **Task (existing)**: Live board item with title, completion, and order; frog designation references one task id.
- **Options surface**: Existing settings groups (palette, appearance, contrast, density, and any other sections already on `main`) presented in a viewport-appropriate shell.
- **Viewport tier**: Conceptual small vs large presentation breakpoint for Options and layout stacking (exact pixel cutover is an implementation detail; must match “phone vs desktop” intent).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a touch-only phone-sized viewport, a new user can designate today's frog from the task list in one tap on a visible control (no hover required) in under 10 seconds.
- **SC-002**: On a touch-only phone-sized viewport, a user can reorder three tasks via drag handles and see the order persist after refresh, with 100% success in a manual test of five consecutive reorder attempts.
- **SC-003**: On a 360×640 viewport, 100% of Options sections are reachable by scrolling inside a full-screen Options surface with no clipped, unreachable controls.
- **SC-004**: In Focus Mode on a phone-width viewport with a frog designated, the frog card appears above the timer, and the timer appears above the bonsai — verified by visual inspection of vertical order.
- **SC-005**: Spot-check of primary icon controls (frog, delete, add, Options, Export, Notepad) shows each hit target ≥ ~44×44 CSS pixels on a phone viewport.
- **SC-006**: No horizontal document scrolling is required to use header actions on a 320px-wide viewport.
- **SC-007**: Desktop Flow/Focus behaviors for frog designation, reorder, and Options remain usable (no functional regression in a desktop smoke pass).

## Assumptions

- Target is **mobile web** in modern iOS Safari and Android Chrome (and desktop browsers) — not a native app store binary.
- “Small viewport” means typical phone widths; a single consistent breakpoint aligned with the app’s existing responsive scale is acceptable.
- Notepad already being full-screen is the pattern to mirror for Options on small viewports.
- Visual drag-handle icons may already exist; v1 still requires a **touch-working** reorder path, not merely a decorative handle beside HTML5-only DnD.
- Delete confirmation and other existing dialogs may receive light mobile polish if needed for tap targets, but a full redesign of every dialog is out of scope unless it blocks a P1/P2 story.
- Grove, sand lightbox, celebrations, and garden visuals stay as on `main` except where safe-area / tap-target / header changes incidentally touch them.
- Night Camp and any night-realm inventory findings are explicitly **out of scope** for this feature (tracked separately if desired later).
- No new backend, auth, or telemetry.
