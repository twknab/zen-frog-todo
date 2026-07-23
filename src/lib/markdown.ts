/**
 * Client-side markdown → safe HTML for the daily notepad preview.
 * Callers must only feed the result into `dangerouslySetInnerHTML`.
 * Uses `marked` + `DOMPurify` (see specs/011-markdown-notepad/research.md).
 *
 * SSR: returns "" when `window` is unavailable; the preview hydrates on the client.
 */

import DOMPurify from "dompurify";
import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function renderMarkdownToSafeHtml(markdown: string): string {
  const source = markdown ?? "";
  if (source.trim() === "") {
    return "";
  }

  const raw = marked.parse(source, { async: false }) as string;

  if (typeof window === "undefined") {
    return "";
  }

  return DOMPurify.sanitize(raw);
}
