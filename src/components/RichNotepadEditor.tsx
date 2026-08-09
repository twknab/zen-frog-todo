"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { alpha, useTheme } from "@mui/material/styles";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Markdown } from "tiptap-markdown";
import NotepadFormattingToolbar from "@/components/NotepadFormattingToolbar";

const MOBILE_FORMAT_ROOT_SELECTOR = "[data-notepad-mobile-format]";

type RichNotepadEditorProps = {
  /** Markdown — the canonical stored form (see specs/022 contract). */
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
};

/**
 * Live WYSIWYG surface over the notepad's markdown (spec 022). The ProseMirror
 * doc is derived from `value` and never persisted; markdown is serialized and
 * emitted ONLY on genuine user edits, so a note merely viewed here round-trips
 * byte-identical (FR-005a verbatim guard). Loaded on demand via next/dynamic.
 */
export default function RichNotepadEditor({
  value,
  onChange,
  placeholder,
}: RichNotepadEditorProps) {
  const theme = useTheme();
  // Phones: selection bubble (native-feeling). Desktop: always-visible top bar.
  // Editor is already dynamic(ssr:false), so media-query hydration isn't a concern.
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"), { noSsr: true });
  // Ref so the editor's onUpdate always sees the latest handler without re-init.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  // The last markdown this component set into or emitted from the editor —
  // external value changes are parsed in; our own echoes are skipped.
  const lastMarkdown = useRef(value);
  const [isEmpty, setIsEmpty] = useState(value.trim().length === 0);

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      // Label the real contenteditable region (a wrapper aria-label wouldn't
      // reach it) — announced as an editable multiline text area (FR-011).
      attributes: {
        "aria-label": "Notepad rich editor",
        role: "textbox",
        "aria-multiline": "true",
      },
    },
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true },
        // Underline has no markdown form — keep the schema markdown-true.
        underline: false,
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Markdown.configure({
        html: true, // pass raw HTML through rather than dropping it (FR-005a)
        transformPastedText: true,
        linkify: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor: current }) => {
      // tiptap-markdown registers `storage.markdown` at runtime; it isn't in
      // TipTap v3's Storage type map, hence the assertion.
      const markdown = (
        current.storage as unknown as {
          markdown: { getMarkdown: () => string };
        }
      ).markdown.getMarkdown();
      lastMarkdown.current = markdown;
      setIsEmpty(current.isEmpty);
      onChangeRef.current(markdown);
    },
  });

  // Parse-in when `value` changes from outside (tab switch, raw-mode edit).
  useEffect(() => {
    if (!editor) return;
    if (value !== lastMarkdown.current) {
      lastMarkdown.current = value;
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // setContent with emitUpdate:false never fires onUpdate — sync manually.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsEmpty(editor.isEmpty);
  }, [editor, value]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        minHeight: 0,
        gap: 0.5,
      }}
    >
      {/* Desktop: always-visible sticky top bar. Phones: keyboard-docked
          format strip (BubbleMenu is unreliable with iOS touch selection). */}
      {editor && isDesktop ? (
        <Box sx={{ position: "sticky", top: 0, zIndex: 2 }}>
          <NotepadFormattingToolbar editor={editor} variant="bar" />
        </Box>
      ) : null}

      {editor && !isDesktop ? <MobileFormatDock editor={editor} /> : null}

      <Box sx={{ position: "relative", flexGrow: 1 }}>
        {isEmpty && placeholder ? (
          <Typography
            aria-hidden
            variant="body2"
            sx={{
              position: "absolute",
              top: 12,
              left: 14,
              right: 14,
              color: "text.disabled",
              pointerEvents: "none",
              lineHeight: 1.65,
            }}
          >
            {placeholder}
          </Typography>
        ) : null}

        <Box
          sx={{
            height: "100%",
            borderRadius: 2,
            // Keep caret/text inside the curve of the focus ring.
            overflow: "hidden",
            transition: theme.transitions.create("box-shadow", {
              duration: 120,
            }),
            "&:focus-within": {
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.28)}`,
            },
            "@media (prefers-reduced-motion: reduce)": { transition: "none" },

            // ProseMirror surface, themed to the app (FR-012) — mirrors the
            // raw-mode TextField's calm, chrome-free look.
            "& .ProseMirror": {
              outline: "none",
              minHeight: 200,
              padding: "12px 14px",
              ...theme.typography.body2,
              // ≥16px on phones — iOS Safari otherwise auto-zooms on focus and
              // hides any nearby chrome (the old bottom toolbar symptom).
              fontSize: { xs: "1rem", md: theme.typography.body2.fontSize },
              lineHeight: 1.65,
              caretColor: theme.palette.primary.main,
              wordBreak: "break-word",
            },
            "& .ProseMirror p": { margin: "0 0 0.55em" },
            "& .ProseMirror h1, & .ProseMirror h2, & .ProseMirror h3, & .ProseMirror h4":
              {
                fontFamily: theme.typography.h6.fontFamily,
                fontWeight: 700,
                lineHeight: 1.3,
                margin: "0.9em 0 0.4em",
              },
            "& .ProseMirror h1": { fontSize: "1.45rem" },
            "& .ProseMirror h2": { fontSize: "1.25rem" },
            "& .ProseMirror h3": { fontSize: "1.1rem" },
            "& .ProseMirror h4": { fontSize: "1rem" },
            "& .ProseMirror ul, & .ProseMirror ol": {
              paddingLeft: "1.5em",
              margin: "0 0 0.55em",
            },
            "& .ProseMirror li > p": { margin: 0 },
            "& .ProseMirror blockquote": {
              margin: "0 0 0.55em",
              paddingLeft: "0.9em",
              borderLeft: `3px solid ${theme.palette.divider}`,
              color: theme.palette.text.secondary,
            },
            "& .ProseMirror code": {
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: "0.85em",
              backgroundColor: theme.palette.action.hover,
              borderRadius: 4,
              padding: "0.1em 0.35em",
            },
            "& .ProseMirror pre": {
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              backgroundColor: theme.palette.action.hover,
              borderRadius: 8,
              padding: "0.75em 1em",
              overflowX: "auto",
              margin: "0 0 0.55em",
            },
            "& .ProseMirror pre code": {
              backgroundColor: "transparent",
              padding: 0,
              fontSize: "0.85em",
            },
            "& .ProseMirror a": {
              color: theme.palette.primary.main,
              textDecorationColor: alpha(theme.palette.primary.main, 0.5),
            },
            "& .ProseMirror hr": {
              border: "none",
              borderTop: `1px solid ${theme.palette.divider}`,
              margin: "1em 0",
            },
            // Task lists — checkboxes aligned with the app's look.
            '& .ProseMirror ul[data-type="taskList"]': {
              listStyle: "none",
              paddingLeft: "0.2em",
            },
            '& .ProseMirror ul[data-type="taskList"] li': {
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5em",
            },
            '& .ProseMirror ul[data-type="taskList"] li > label': {
              flexShrink: 0,
              marginTop: "0.15em",
            },
            '& .ProseMirror ul[data-type="taskList"] input[type="checkbox"]': {
              accentColor: theme.palette.primary.main,
              width: 16,
              height: 16,
              cursor: "pointer",
            },
            '& .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div':
              {
                color: theme.palette.text.disabled,
                textDecoration: "line-through",
              },
          }}
        >
          <EditorContent editor={editor} style={{ height: "100%" }} />
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Phone formatting chrome: fixed above the soft keyboard while the editor is
 * focused or has a text selection. TipTap's BubbleMenu often never appears on
 * iOS touch selections; pinning to visualViewport is the reliable pattern.
 */
function MobileFormatDock({ editor }: { editor: Editor }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [mounted, setMounted] = useState(false);
  const blurTimer = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const syncOpen = () => {
      if (blurTimer.current != null) {
        window.clearTimeout(blurTimer.current);
        blurTimer.current = null;
      }
      const focused = editor.isFocused;
      const hasSelection = !editor.state.selection.empty;
      // Stay open while the link popover (ported to body) holds focus.
      const inFormatUi = Boolean(
        document.activeElement?.closest(MOBILE_FORMAT_ROOT_SELECTOR) ||
          document.activeElement?.closest(".MuiPopover-root"),
      );
      if (focused || hasSelection || inFormatUi) {
        setOpen(true);
        return;
      }
      // Delay hide so toolbar taps (mousedown→blur→click) don't flash away.
      blurTimer.current = window.setTimeout(() => {
        const stillInUi = Boolean(
          document.activeElement?.closest(MOBILE_FORMAT_ROOT_SELECTOR) ||
            document.activeElement?.closest(".MuiPopover-root"),
        );
        if (!editor.isFocused && editor.state.selection.empty && !stillInUi) {
          setOpen(false);
        }
      }, 180);
    };

    editor.on("focus", syncOpen);
    editor.on("blur", syncOpen);
    editor.on("selectionUpdate", syncOpen);
    editor.on("transaction", syncOpen);
    document.addEventListener("selectionchange", syncOpen);
    syncOpen();

    return () => {
      editor.off("focus", syncOpen);
      editor.off("blur", syncOpen);
      editor.off("selectionUpdate", syncOpen);
      editor.off("transaction", syncOpen);
      document.removeEventListener("selectionchange", syncOpen);
      if (blurTimer.current != null) window.clearTimeout(blurTimer.current);
    };
  }, [editor]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const syncKeyboard = () => {
      // Layout bottom minus visible viewport bottom ≈ on-screen keyboard height.
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardInset(inset);
    };

    vv.addEventListener("resize", syncKeyboard);
    vv.addEventListener("scroll", syncKeyboard);
    syncKeyboard();
    return () => {
      vv.removeEventListener("resize", syncKeyboard);
      vv.removeEventListener("scroll", syncKeyboard);
    };
  }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <Box
      data-notepad-mobile-format=""
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: keyboardInset,
        zIndex: theme.zIndex.modal + 2,
        display: "flex",
        justifyContent: "center",
        px: 1,
        pt: 0.75,
        pb: `max(8px, env(safe-area-inset-bottom))`,
        // Soft scrim so the strip reads as keyboard-accessory chrome.
        background: `linear-gradient(to top, ${alpha(theme.palette.background.default, 0.96)} 55%, ${alpha(theme.palette.background.default, 0)})`,
        pointerEvents: "none",
        "& > *": { pointerEvents: "auto" },
      }}
    >
      <NotepadFormattingToolbar editor={editor} variant="bubble" />
    </Box>,
    document.body,
  );
}
