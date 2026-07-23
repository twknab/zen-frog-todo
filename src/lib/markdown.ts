/**
 * Shared react-markdown plugin config for themed GFM previews.
 * Used by MarkdownPreview (live notepad + Grove archived reflection).
 * See specs/011-markdown-notepad/research.md Decision 5.
 */

import type { PluggableList } from "unified";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

export const markdownRemarkPlugins: PluggableList = [remarkGfm];
export const markdownRehypePlugins: PluggableList = [rehypeSanitize];
