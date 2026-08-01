"use client";

import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import FormatBoldOutlinedIcon from "@mui/icons-material/FormatBoldOutlined";
import FormatItalicOutlinedIcon from "@mui/icons-material/FormatItalicOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import FormatListNumberedOutlinedIcon from "@mui/icons-material/FormatListNumberedOutlined";
import FormatQuoteOutlinedIcon from "@mui/icons-material/FormatQuoteOutlined";
import FormatStrikethroughOutlinedIcon from "@mui/icons-material/FormatStrikethroughOutlined";
import HorizontalRuleOutlinedIcon from "@mui/icons-material/HorizontalRuleOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Markdown } from "tiptap-markdown";
import { useCallback, useEffect, useRef, type ReactNode } from "react";

const lowlight = createLowlight(common);

export type RichNotepadEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
};

function FormatButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip title={label}>
      <IconButton
        size="small"
        aria-label={label}
        aria-pressed={active}
        onClick={onClick}
        color={active ? "primary" : "default"}
        sx={{
          borderRadius: 1,
          color: active ? "primary.main" : "text.secondary",
          bgcolor: active ? "action.selected" : "transparent",
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

function HeadingChip({
  level,
  editor,
}: {
  level: 1 | 2 | 3;
  editor: Editor;
}) {
  const active = editor.isActive("heading", { level });
  return (
    <Tooltip title={`Heading ${level}`}>
      <IconButton
        size="small"
        aria-label={`Heading ${level}`}
        aria-pressed={active}
        onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
        sx={{
          borderRadius: 1,
          minWidth: 28,
          px: 0.75,
          color: active ? "primary.main" : "text.secondary",
          bgcolor: active ? "action.selected" : "transparent",
        }}
      >
        <Typography
          component="span"
          sx={{ fontSize: "0.7rem", fontWeight: 700, lineHeight: 1 }}
        >
          H{level}
        </Typography>
      </IconButton>
    </Tooltip>
  );
}

function FormatToolbar({ editor, onSetLink }: { editor: Editor; onSetLink: () => void }) {
  return (
    <Stack
      direction="row"
      spacing={0.25}
      useFlexGap
      role="toolbar"
      aria-label="Formatting"
      sx={{
        flexShrink: 0,
        flexWrap: "wrap",
        alignItems: "center",
        width: "100%",
        px: 0.25,
        py: 0.75,
        mb: 0,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        position: "sticky",
        top: 0,
        zIndex: 1,
      }}
    >
      <HeadingChip level={1} editor={editor} />
      <HeadingChip level={2} editor={editor} />
      <HeadingChip level={3} editor={editor} />
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
      <FormatButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <FormatBoldOutlinedIcon fontSize="small" />
      </FormatButton>
      <FormatButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <FormatItalicOutlinedIcon fontSize="small" />
      </FormatButton>
      <FormatButton
        label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <FormatStrikethroughOutlinedIcon fontSize="small" />
      </FormatButton>
      <FormatButton
        label="Inline code"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <CodeOutlinedIcon fontSize="small" />
      </FormatButton>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
      <FormatButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <FormatListBulletedOutlinedIcon fontSize="small" />
      </FormatButton>
      <FormatButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <FormatListNumberedOutlinedIcon fontSize="small" />
      </FormatButton>
      <FormatButton
        label="Checklist"
        active={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        <ChecklistOutlinedIcon fontSize="small" />
      </FormatButton>
      <FormatButton
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <FormatQuoteOutlinedIcon fontSize="small" />
      </FormatButton>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
      <FormatButton label="Link" active={editor.isActive("link")} onClick={onSetLink}>
        <LinkOutlinedIcon fontSize="small" />
      </FormatButton>
      <FormatButton
        label="Horizontal rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <HorizontalRuleOutlinedIcon fontSize="small" />
      </FormatButton>
    </Stack>
  );
}

/**
 * TipTap rich surface for the notepad. Markdown remains canonical — the
 * ProseMirror doc is in-memory only. onChange fires only on genuine user edits
 * so merely viewing a note in rich mode never rewrites storage (FR-005a).
 * See specs/022-wysiwyg-notepad/contracts/rich-notepad-editor-contract.md.
 */
export default function RichNotepadEditor({
  value,
  onChange,
  placeholder = "Start writing…",
}: RichNotepadEditorProps) {
  const theme = useTheme();
  const lastExternalMarkdown = useRef(value);
  const applyingExternal = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        // Replaced by CodeBlockLowlight for fenced-block syntax highlighting.
        codeBlock: false,
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer" },
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        // Untagged fences still get JS highlighting — most notes are code-ish.
        defaultLanguage: "javascript",
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        "aria-label": "Notepad rich editor",
        role: "textbox",
        "aria-multiline": "true",
      },
    },
    onUpdate: ({ editor: current }) => {
      if (applyingExternal.current) return;
      const storage = current.storage as {
        markdown?: { getMarkdown: () => string };
      };
      const markdown = storage.markdown?.getMarkdown() ?? "";
      lastExternalMarkdown.current = markdown;
      onChange(markdown);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value === lastExternalMarkdown.current) return;

    // While typing, parent may echo a normalized markdown string — don't
    // reset the doc (that steals the caret and feels like "can't type").
    if (editor.isFocused) {
      const storage = editor.storage as {
        markdown?: { getMarkdown: () => string };
      };
      const live = storage.markdown?.getMarkdown() ?? "";
      if (live === value) {
        lastExternalMarkdown.current = value;
        return;
      }
    }

    applyingExternal.current = true;
    editor.commands.setContent(value, { emitUpdate: false });
    lastExternalMarkdown.current = value;
    applyingExternal.current = false;
  }, [editor, value]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const next = window.prompt("Link URL", previous ?? "https://");
    if (next === null) return;
    const trimmed = next.trim();
    if (trimmed === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
  }, [editor]);

  if (!editor) {
    return (
      <Box
        sx={{
          height: "100%",
          minHeight: 0,
          typography: "body2",
          color: "text.secondary",
          py: 1,
        }}
      >
        Loading editor…
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        flexGrow: 1,
        "& .tiptap-surface": {
          flex: "1 1 auto",
          minHeight: 0,
          overflow: "auto",
          cursor: "text",
          // TipTap wraps ProseMirror in an extra div — stretch both so clicks
          // anywhere in the pane focus/type like a normal editor.
          "& > div": {
            height: "100%",
            minHeight: "100%",
          },
        },
        "& .ProseMirror": {
          outline: "none",
          typography: "body2",
          lineHeight: 1.65,
          color: "text.primary",
          height: "100%",
          minHeight: "100%",
          boxSizing: "border-box",
          px: 0.25,
          py: 1,
          cursor: "text",
          // No background shift on focus — keep the writing surface steady.
          "&:focus": { outline: "none" },
          "&:focus-visible": { outline: "none" },
          "& p.is-editor-empty:first-of-type::before": {
            color: "text.disabled",
            content: "attr(data-placeholder)",
            float: "left",
            height: 0,
            pointerEvents: "none",
          },
          "& h1, & h2, & h3": {
            fontFamily: theme.typography.h6.fontFamily,
            fontWeight: 650,
            lineHeight: 1.3,
            mt: 1.5,
            mb: 0.75,
          },
          "& h1": { fontSize: "1.5rem" },
          "& h2": { fontSize: "1.25rem" },
          "& h3": { fontSize: "1.1rem" },
          "& p": { my: 0.75 },
          "& ul, & ol": { pl: 2.5, my: 0.75 },
          "& ul[data-type='taskList']": {
            listStyle: "none",
            pl: 0,
            "& li": {
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              "& > label": { mt: "0.35em", flexShrink: 0 },
              "& > div": { flexGrow: 1 },
            },
          },
          "& blockquote": {
            borderLeft: "3px solid",
            borderColor: "divider",
            pl: 1.5,
            ml: 0,
            my: 1,
            color: "text.secondary",
          },
          "& code": {
            typography: "body2",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            bgcolor: "action.hover",
            borderRadius: 0.75,
            px: 0.5,
            py: "1px",
          },
          "& pre": {
            bgcolor: "action.hover",
            borderRadius: 1.5,
            p: 1.5,
            overflow: "auto",
            my: 1,
            "& code": {
              bgcolor: "transparent",
              p: 0,
              display: "block",
              color: "text.primary",
            },
            // Real highlight.js token colors — stronger contrast than theme greys
            // so keywords/strings actually read as syntax highlighting.
            "& .hljs-comment, & .hljs-quote, & .hljs-deletion": {
              color: "text.disabled",
              fontStyle: "italic",
            },
            "& .hljs-keyword, & .hljs-selector-tag, & .hljs-meta .hljs-keyword, & .hljs-doctag": {
              color: "primary.main",
              fontWeight: 600,
            },
            "& .hljs-string, & .hljs-attr, & .hljs-template-variable, & .hljs-addition": {
              color: "success.main",
            },
            "& .hljs-number, & .hljs-literal, & .hljs-variable, & .hljs-type, & .hljs-params": {
              color: "info.main",
            },
            "& .hljs-title, & .hljs-section, & .hljs-title.function_, & .hljs-function .hljs-title": {
              color: "warning.main",
              fontWeight: 600,
            },
            "& .hljs-built_in, & .hljs-class .hljs-title, & .hljs-name, & .hljs-tag": {
              color: "secondary.main",
            },
            "& .hljs-property, & .hljs-attribute, & .hljs-meta, & .hljs-subst": {
              color: "text.secondary",
            },
            "& .hljs-punctuation, & .hljs-operator": {
              color: "text.secondary",
            },
          },
          "& hr": {
            border: "none",
            borderTop: "1px solid",
            borderColor: "divider",
            my: 2,
          },
          "& a": {
            color: "primary.main",
            textDecoration: "underline",
            textUnderlineOffset: 2,
          },
        },
      }}
    >
      <FormatToolbar editor={editor} onSetLink={setLink} />

      <Box
        className="tiptap-surface"
        onMouseDown={(event) => {
          // Clicking empty padding below the last line should still focus the caret.
          if (event.target === event.currentTarget) {
            event.preventDefault();
            editor.chain().focus("end").run();
          }
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
