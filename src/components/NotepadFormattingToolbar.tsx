"use client";

import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import FormatBoldOutlinedIcon from "@mui/icons-material/FormatBoldOutlined";
import FormatItalicOutlinedIcon from "@mui/icons-material/FormatItalicOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import FormatListNumberedOutlinedIcon from "@mui/icons-material/FormatListNumberedOutlined";
import FormatQuoteOutlinedIcon from "@mui/icons-material/FormatQuoteOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import RedoOutlinedIcon from "@mui/icons-material/RedoOutlined";
import StrikethroughSOutlinedIcon from "@mui/icons-material/StrikethroughSOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type { Editor } from "@tiptap/react";
import { useReducedMotion } from "framer-motion";
import {
  useEffect,
  useReducer,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

type NotepadFormattingToolbarProps = {
  editor: Editor;
};

/**
 * Classic word-processor formatting bar for the rich notepad (spec 022,
 * FR-013/FR-015): the iconography everyone already knows — bold, italic,
 * headings, lists, checklist, quote, code, link, undo/redo. Mobile-first:
 * ≥44px touch targets at phone widths, horizontal scroll instead of wrapping.
 */
export default function NotepadFormattingToolbar({
  editor,
}: NotepadFormattingToolbarProps) {
  const reduce = useReducedMotion();
  const [linkAnchor, setLinkAnchor] = useState<HTMLElement | null>(null);
  const [linkUrl, setLinkUrl] = useState("");

  // Re-render on every editor transaction so active states track the caret.
  const [, forceUpdate] = useReducer((tick: number) => tick + 1, 0);
  useEffect(() => {
    editor.on("transaction", forceUpdate);
    return () => {
      editor.off("transaction", forceUpdate);
    };
  }, [editor]);

  const state = {
    bold: editor.isActive("bold"),
    italic: editor.isActive("italic"),
    strike: editor.isActive("strike"),
    h1: editor.isActive("heading", { level: 1 }),
    h2: editor.isActive("heading", { level: 2 }),
    bulletList: editor.isActive("bulletList"),
    orderedList: editor.isActive("orderedList"),
    taskList: editor.isActive("taskList"),
    blockquote: editor.isActive("blockquote"),
    code: editor.isActive("code"),
    link: editor.isActive("link"),
    canUndo: editor.can().undo(),
    canRedo: editor.can().redo(),
  };

  const openLinkPopover = (anchor: HTMLElement) => {
    setLinkUrl((editor.getAttributes("link").href as string | undefined) ?? "");
    setLinkAnchor(anchor);
  };

  const applyLink = (event: FormEvent) => {
    event.preventDefault();
    const href = linkUrl.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (href) {
      chain.setLink({ href }).run();
    } else {
      chain.unsetLink().run();
    }
    setLinkAnchor(null);
  };

  const buttons: Array<
    | {
        key: string;
        label: string;
        icon: ReactNode;
        active?: boolean;
        disabled?: boolean;
        onClick: (anchor: HTMLElement) => void;
      }
    | "divider"
  > = [
    {
      key: "bold",
      label: "Bold",
      icon: <FormatBoldOutlinedIcon fontSize="small" />,
      active: state.bold,
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      key: "italic",
      label: "Italic",
      icon: <FormatItalicOutlinedIcon fontSize="small" />,
      active: state.italic,
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      key: "strike",
      label: "Strikethrough",
      icon: <StrikethroughSOutlinedIcon fontSize="small" />,
      active: state.strike,
      onClick: () => editor.chain().focus().toggleStrike().run(),
    },
    "divider",
    {
      key: "h1",
      label: "Heading 1",
      icon: <HeadingGlyph level={1} />,
      active: state.h1,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      key: "h2",
      label: "Heading 2",
      icon: <HeadingGlyph level={2} />,
      active: state.h2,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    "divider",
    {
      key: "bulletList",
      label: "Bulleted list",
      icon: <FormatListBulletedOutlinedIcon fontSize="small" />,
      active: state.bulletList,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      key: "orderedList",
      label: "Numbered list",
      icon: <FormatListNumberedOutlinedIcon fontSize="small" />,
      active: state.orderedList,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      key: "taskList",
      label: "Checklist",
      icon: <ChecklistOutlinedIcon fontSize="small" />,
      active: state.taskList,
      onClick: () => editor.chain().focus().toggleTaskList().run(),
    },
    "divider",
    {
      key: "blockquote",
      label: "Quote",
      icon: <FormatQuoteOutlinedIcon fontSize="small" />,
      active: state.blockquote,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      key: "code",
      label: "Inline code",
      icon: <CodeOutlinedIcon fontSize="small" />,
      active: state.code,
      onClick: () => editor.chain().focus().toggleCode().run(),
    },
    {
      key: "link",
      label: "Link",
      icon: <LinkOutlinedIcon fontSize="small" />,
      active: state.link,
      onClick: (anchor) => openLinkPopover(anchor),
    },
    "divider",
    {
      key: "undo",
      label: "Undo",
      icon: <UndoOutlinedIcon fontSize="small" />,
      disabled: !state.canUndo,
      onClick: () => editor.chain().focus().undo().run(),
    },
    {
      key: "redo",
      label: "Redo",
      icon: <RedoOutlinedIcon fontSize="small" />,
      disabled: !state.canRedo,
      onClick: () => editor.chain().focus().redo().run(),
    },
  ];

  return (
    <>
      <Stack
        direction="row"
        role="toolbar"
        aria-label="Text formatting"
        spacing={0.25}
        sx={{
          alignItems: "center",
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          // Soft edges so the scrollable bar reads as one calm strip.
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          px: 0.5,
          py: 0.25,
          width: "fit-content",
          maxWidth: "100%",
        }}
      >
        {buttons.map((item, index) =>
          item === "divider" ? (
            <Divider
              key={`divider-${index}`}
              orientation="vertical"
              flexItem
              sx={{ mx: 0.25, my: 0.75, borderColor: "divider", opacity: 0.8 }}
            />
          ) : (
            <Tooltip key={item.key} title={item.label} enterDelay={600}>
              <span>
                <IconButton
                  aria-label={item.label}
                  aria-pressed={item.active ?? undefined}
                  disabled={item.disabled}
                  // Keep focus (and the text selection) in the editor when a
                  // formatting button is clicked — the canonical toolbar fix.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={(event) => item.onClick(event.currentTarget)}
                  sx={{
                    // ≥44px touch targets on phones; tighter on desktop.
                    width: { xs: 44, md: 34 },
                    height: { xs: 44, md: 34 },
                    borderRadius: 1.5,
                    color: item.active ? "primary.main" : "text.secondary",
                    bgcolor: item.active ? "action.selected" : "transparent",
                    flexShrink: 0,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  {item.icon}
                </IconButton>
              </span>
            </Tooltip>
          ),
        )}
      </Stack>

      <Popover
        open={Boolean(linkAnchor)}
        anchorEl={linkAnchor}
        onClose={() => setLinkAnchor(null)}
        transitionDuration={reduce ? 0 : undefined}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: {
              p: 1.5,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            },
          },
        }}
      >
        <Box component="form" onSubmit={applyLink}>
          <Stack spacing={1} sx={{ minWidth: 260 }}>
            <TextField
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="https://…"
              size="small"
              autoFocus
              fullWidth
              aria-label="Link URL"
              type="url"
            />
            <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
              {state.link ? (
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => {
                    editor.chain().focus().extendMarkRange("link").unsetLink().run();
                    setLinkAnchor(null);
                  }}
                >
                  Remove
                </Button>
              ) : null}
              <Button size="small" type="submit" variant="contained" disableElevation>
                {state.link ? "Update" : "Add link"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </>
  );
}

/** "H1"/"H2" text glyphs — the classic heading-button convention. */
function HeadingGlyph({ level }: { level: 1 | 2 }) {
  return (
    <Typography
      component="span"
      sx={{ fontSize: "0.8rem", fontWeight: 800, letterSpacing: "0.02em" }}
    >
      H{level}
    </Typography>
  );
}
