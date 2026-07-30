"use client";

import type { FullExport } from "./dayArchive";

/**
 * Spreadsheet flavour of "Export everything" (spec 022). Renders the same
 * FullExport document the JSON backup uses into a human-readable .xlsx
 * workbook — one sheet per concern — so days can be skimmed, sorted, and
 * filtered outside the app. The JSON backup remains the re-importable format;
 * this workbook is for reading, not restoring.
 *
 * SheetJS is loaded lazily at click time so the (large) library stays out of
 * the initial page bundle.
 */

type Row = (string | number)[];

/** Set approximate column widths (in characters) on a worksheet. */
function withColumnWidths<T extends object>(sheet: T, widths: number[]): T {
  (sheet as { "!cols"?: { wch: number }[] })["!cols"] = widths.map((wch) => ({ wch }));
  return sheet;
}

/** Local YYYY-MM-DD for the live (still-open) day's rows. */
function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Build the workbook sheets as arrays-of-arrays, pure and testable. */
export function buildWorkbookRows(full: FullExport): {
  days: Row[];
  completedTasks: Row[];
  openTasks: Row[];
  notes: Row[];
  today: Row[];
} {
  const today = localDateString(new Date(full.exportedAt));

  const days: Row[] = [
    ["Date", "Closed at", "Completed", "Still open", "Focus sessions", "Bonsai leaves", "Bonsai stage", "Note"],
    ...full.archive.map((day) => [
      day.date,
      day.closedAt,
      day.completedTasks.length,
      day.openTasks?.length ?? 0,
      day.focusSessions,
      day.bonsai.leaves,
      day.bonsai.stage,
      day.reflection,
    ]),
  ];

  const completedTasks: Row[] = [["Date", "Task", "Note", "Completed at"]];
  for (const entry of full.live.completedLog) {
    completedTasks.push([`${today} (today)`, entry.taskTitle, entry.note, entry.completedAt]);
  }
  for (const day of full.archive) {
    for (const task of day.completedTasks) {
      completedTasks.push([day.date, task.title, task.note, task.completedAt]);
    }
  }

  const openTasks: Row[] = [["Date", "Task"]];
  for (const task of full.live.tasks) {
    if (!task.completed) openTasks.push([`${today} (today)`, task.title]);
  }
  for (const day of full.archive) {
    for (const task of day.openTasks ?? []) {
      openTasks.push([day.date, task.title]);
    }
  }

  const notes: Row[] = [
    ["Note", "Markdown"],
    ...full.notepad.tabs.map((tab) => [tab.title, tab.body]),
  ];

  const today_: Row[] = [
    ["Field", "Value"],
    ["Exported at", full.exportedAt],
    ["Today's note", full.live.reflection],
    ["Focus sessions", full.live.focusSessions],
    ["Bonsai leaves", full.live.bonsai.leaves],
    ["Bonsai stage", full.live.bonsai.stage],
    ["Open tasks", full.live.tasks.filter((t) => !t.completed).length],
    ["Completed tasks", full.live.completedLog.length],
  ];

  return { days, completedTasks, openTasks, notes, today: today_ };
}

/** Filename for the workbook: `frog-garden-all-<date>.xlsx`. */
export function xlsxExportFilename(now: Date): string {
  return `frog-garden-all-${localDateString(now)}.xlsx`;
}

/**
 * Render `full` into an .xlsx workbook and download it. `writeFile` handles the
 * anchor-click download itself, entirely on-device.
 */
export async function downloadXlsxExport(filename: string, full: FullExport): Promise<void> {
  const XLSX = await import("xlsx");
  const rows = buildWorkbookRows(full);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    withColumnWidths(XLSX.utils.aoa_to_sheet(rows.days), [12, 22, 10, 10, 14, 13, 12, 60]),
    "Days",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    withColumnWidths(XLSX.utils.aoa_to_sheet(rows.completedTasks), [16, 40, 40, 22]),
    "Completed tasks",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    withColumnWidths(XLSX.utils.aoa_to_sheet(rows.openTasks), [16, 40]),
    "Open tasks",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    withColumnWidths(XLSX.utils.aoa_to_sheet(rows.notes), [24, 80]),
    "Notes",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    withColumnWidths(XLSX.utils.aoa_to_sheet(rows.today), [18, 40]),
    "Today",
  );

  XLSX.writeFile(workbook, filename);
}
