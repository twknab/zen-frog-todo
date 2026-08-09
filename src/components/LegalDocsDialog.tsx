"use client";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useReducedMotion } from "framer-motion";
import { useId, useState } from "react";
import {
  LEGAL_DOCS,
  type LegalDocId,
  getLegalDoc,
} from "@/lib/legalDocs";

type LegalDocsDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Which document to show when opening; defaults to Privacy. */
  initialDocId?: LegalDocId;
};

/**
 * Scalable legal / policy modal: sidebar nav for multiple docs, calm reading
 * pane. Add entries in `legalDocs.ts` — no layout redesign required (023).
 * Remount (via parent `key`) when reopening to reset the active doc.
 */
export default function LegalDocsDialog({
  open,
  onClose,
  initialDocId = "privacy",
}: LegalDocsDialogProps) {
  const reduce = useReducedMotion();
  const titleId = useId();
  const [activeId, setActiveId] = useState<LegalDocId>(initialDocId);
  const doc = getLegalDoc(activeId);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby={titleId}
      transitionDuration={reduce ? 0 : undefined}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            backgroundImage: "none",
            overflow: "hidden",
            maxHeight: { xs: "92vh", md: "80vh" },
          },
        },
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, sm: 2.5 },
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography id={titleId} variant="h6" component="h2" sx={{ fontWeight: 650 }}>
            {doc.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {doc.updatedLabel}
          </Typography>
        </Box>
        <IconButton aria-label="Close" onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <DialogContent sx={{ p: 0, display: "flex", minHeight: 0 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{ width: "100%", minHeight: { sm: 360 } }}
        >
          {/* Always show doc nav so adding Terms / etc. later is drop-in. */}
          <Stack
            component="nav"
            aria-label="Legal documents"
            spacing={0.5}
            sx={{
              flexShrink: 0,
              width: { sm: 160 },
              px: 1.5,
              py: 1.5,
              borderBottom: { xs: "1px solid", sm: "none" },
              borderRight: { sm: "1px solid" },
              borderColor: "divider",
            }}
          >
            {LEGAL_DOCS.map((entry) => {
              const active = entry.id === activeId;
              return (
                <ButtonBase
                  key={entry.id}
                  onClick={() => setActiveId(entry.id)}
                  aria-current={active ? "page" : undefined}
                  sx={{
                    justifyContent: "flex-start",
                    px: 1.25,
                    py: 0.85,
                    borderRadius: 2,
                    typography: "body2",
                    fontWeight: active ? 650 : 500,
                    color: active ? "primary.main" : "text.secondary",
                    bgcolor: active ? "action.selected" : "transparent",
                    "&:hover": {
                      color: "text.primary",
                      bgcolor: active ? "action.selected" : "action.hover",
                    },
                  }}
                >
                  {entry.navLabel}
                </ButtonBase>
              );
            })}
          </Stack>

          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
              px: { xs: 2, sm: 3 },
              py: { xs: 2, sm: 2.5 },
              overflow: "auto",
            }}
          >
            <Stack spacing={2.5}>
              {doc.sections.map((section) => (
                <Box key={section.heading} component="section">
                  <Typography
                    variant="subtitle2"
                    component="h3"
                    sx={{ fontWeight: 700, mb: 0.75, color: "text.primary" }}
                  >
                    {section.heading}
                  </Typography>
                  <Stack spacing={1}>
                    {section.paragraphs.map((paragraph, index) => (
                      <Typography
                        key={`${section.heading}-${index}`}
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.65 }}
                      >
                        {paragraph}
                      </Typography>
                    ))}
                    {section.links?.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        underline="hover"
                        sx={{ fontWeight: 650, width: "fit-content" }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
