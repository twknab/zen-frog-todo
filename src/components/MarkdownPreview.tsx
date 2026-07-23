"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import ReactMarkdown from "react-markdown";
import {
  markdownRehypePlugins,
  markdownRemarkPlugins,
} from "@/lib/markdown";

type MarkdownPreviewProps = {
  markdown: string;
  /** Optional sx merge for the outer container. */
  sx?: SxProps<Theme>;
};

/**
 * Themed GFM markdown render via react-markdown + remark-gfm + rehype-sanitize.
 * Shared by the live notepad preview and The Grove day recap
 * (specs/011-markdown-notepad).
 */
export default function MarkdownPreview({ markdown, sx }: MarkdownPreviewProps) {
  const source = markdown ?? "";

  if (source.trim() === "") {
    return (
      <Typography variant="body2" color="text.secondary" sx={sx}>
        Nothing to preview yet — switch to Write and jot a thought.
      </Typography>
    );
  }

  return (
    <Box
      className="markdown-preview"
      sx={[
        {
          color: "text.primary",
          typography: "body2",
          "& :first-of-type": { mt: 0 },
          "& :last-child": { mb: 0 },
          "& h1, & h2, & h3, & h4, & h5, & h6": {
            fontFamily: "inherit",
            fontWeight: 600,
            color: "text.primary",
            mt: 1.5,
            mb: 0.75,
            lineHeight: 1.35,
          },
          "& h1": { fontSize: "1.35rem" },
          "& h2": { fontSize: "1.2rem" },
          "& h3": { fontSize: "1.05rem" },
          "& p": { my: 1, lineHeight: 1.65 },
          "& ul, & ol": {
            my: 1,
            pl: 2.5,
          },
          "& li": { my: 0.35 },
          "& li > input[type=checkbox]": {
            mr: 1,
            verticalAlign: "middle",
          },
          "& a": {
            color: "secondary.main",
            textDecorationThickness: "1px",
            textUnderlineOffset: "2px",
          },
          "& code": {
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: "0.85em",
            px: 0.6,
            py: 0.15,
            borderRadius: 1,
            bgcolor: "action.hover",
          },
          "& pre": {
            my: 1.25,
            p: 1.5,
            borderRadius: 2,
            bgcolor: "action.hover",
            overflow: "auto",
          },
          "& pre code": {
            p: 0,
            bgcolor: "transparent",
            fontSize: "0.8rem",
          },
          "& blockquote": {
            my: 1.25,
            pl: 1.5,
            borderLeft: 3,
            borderColor: "divider",
            color: "text.secondary",
          },
          "& hr": {
            my: 2,
            border: 0,
            borderTop: 1,
            borderColor: "divider",
          },
          "& table": {
            width: "100%",
            borderCollapse: "collapse",
            my: 1.5,
            typography: "body2",
          },
          "& th, & td": {
            border: 1,
            borderColor: "divider",
            px: 1.25,
            py: 0.75,
            textAlign: "left",
          },
          "& th": {
            fontWeight: 600,
            bgcolor: "action.hover",
          },
          "& del": {
            color: "text.secondary",
          },
          "& img": {
            maxWidth: "100%",
            borderRadius: 1,
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <ReactMarkdown
        remarkPlugins={markdownRemarkPlugins}
        rehypePlugins={markdownRehypePlugins}
      >
        {source}
      </ReactMarkdown>
    </Box>
  );
}
