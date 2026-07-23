# Accessibility Requirements Checklist: Markdown Notepad

**Purpose**: Validate that accessibility requirements in the spec are complete, clear, and consistent before/during implementation  
**Created**: 2026-07-22  
**Feature**: [spec.md](../spec.md)  
**Focus**: Accessibility (keyboard, screen reader, reduced motion, contrast)

## Requirement Completeness

- [x] CHK001 Write/preview toggle keyboard operability is specified (FR-013, US1 AS5)
- [x] CHK002 Screen-reader labelling / current-mode announcement is specified (FR-013)
- [x] CHK003 `prefers-reduced-motion` fallback for mode switch is specified (FR-014, US1 AS6)
- [x] CHK004 Focus Mode hiding of notepad is specified (FR-016)
- [x] CHK005 Empty-state behavior without shame/guilt copy is specified (FR-017, Edge Cases)
- [x] CHK006 Grove archived-note presentation accessibility is implied via reuse of dialog patterns + rendered preview (FR-008)

## Requirement Clarity

- [x] CHK007 "Session-only mode, default write" is unambiguous (FR-018)
- [x] CHK008 Sanitization requirement for preview (no script execution) is testable (FR-012)
- [x] CHK009 Theme-token / non-stock-MUI requirement is stated (FR-015)

## Coverage Gaps (none blocking)

- Notes: Contrast AA is covered by constitution Principle IV globally; spec does not restate numeric contrast ratios — acceptable given project-wide gate.

## Notes

- Checklist validates **requirements quality**, not runtime verification (runtime lives in `quickstart.md`).
