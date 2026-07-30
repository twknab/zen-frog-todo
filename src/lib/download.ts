"use client";

/**
 * Shared on-device file download: build a Blob, click a temporary object-URL
 * anchor, then revoke the URL. No network. Used by the JSON, Markdown, and
 * XLSX export paths so they all leave the browser the same way.
 */
export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Download `text` as a file with the given MIME type. */
export function downloadText(filename: string, text: string, mime: string): void {
  downloadBlob(filename, new Blob([text], { type: mime }));
}
