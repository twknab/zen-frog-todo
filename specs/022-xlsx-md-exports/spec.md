# 022 — Excel export + per-note Markdown export

## Summary

The export menu's "Export everything" dump was JSON-only, and notepad notes
could only leave the app inside that big JSON. This feature adds a
human-readable **.xlsx workbook** flavour of "export everything" and lets each
notepad note download as its **own Markdown file**. The JSON full backup stays —
it is the re-importable format the notepad import understands.

## Scope

- **In:** "Export everything (Excel)" menu item — one `.xlsx` workbook with
  sheets for Days, Completed tasks, Open tasks, Notes, and Today, built from
  the same `FullExport` document as the JSON backup.
- **In:** A "Notes as Markdown" section in the export menu — one item per
  notepad tab, downloading `<title>.md` (title sanitized for filesystems).
- **In:** Keep the JSON full backup (relabelled "Full backup (JSON)") and the
  per-day JSON exports unchanged.
- **Out:** XLSX import; per-day XLSX; exporting sand drawings into the
  workbook; changing the backup schema.

## Acceptance criteria

- [ ] Export menu shows "Export everything (Excel)"; clicking downloads
      `frog-garden-all-<date>.xlsx` with the five sheets above.
- [ ] Each notepad tab appears under "Notes as Markdown"; clicking downloads
      that tab's body as a `.md` file named from its title.
- [ ] JSON full backup and per-day JSON exports behave exactly as before, and
      the JSON backup still round-trips through the notepad import.
- [ ] Everything stays on-device (constitution: local-first; SheetJS is
      dynamically imported at click time, no network).

## Technical notes

- `src/lib/exportXlsx.ts` — pure row-builder + lazy SheetJS workbook writer.
- `src/lib/download.ts` — shared blob-download helper (JSON/MD/XLSX paths).
- `src/lib/dayArchive.ts` — `useGatherFullExport()` shared by
  `useExportEverything()` (JSON) and `useExportEverythingXlsx()`.
- `src/lib/notepad.ts` — `noteMarkdownFilename()`, `downloadNoteMarkdown()`,
  read-only `useNotepadTabs()`.
- Dependency: `xlsx` 0.20.3 from the SheetJS CDN tarball (the npm-registry
  0.18.5 has unfixed advisories; 0.20.x fixes them, and we only write, never
  parse, spreadsheets).
