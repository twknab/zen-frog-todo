"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useReducedMotion } from "framer-motion";

export type SandGalleryItem = {
  id: string;
  src: string;
  alt: string;
};

type SandDrawingGalleryProps = {
  items: SandGalleryItem[];
  /** Section heading — calm, non-judgmental. */
  heading?: string;
  onSelect: (index: number) => void;
  /** Thumbnail CSS width. */
  thumbWidth?: number;
};

/**
 * Horizontal thumbnail strip for a day's sand drawings — common gallery pattern:
 * glanceable thumbs at the bottom of a day recap, keyboard-focusable buttons.
 */
export default function SandDrawingGallery({
  items,
  heading = "Sand",
  onSelect,
  thumbWidth = 96,
}: SandDrawingGalleryProps) {
  const reduce = useReducedMotion();
  if (items.length === 0) return null;

  return (
    <Stack spacing={0.75}>
      <Typography variant="subtitle2" component="h3" color="text.secondary">
        {heading}
        {items.length > 1 ? (
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {items.length} drawings
          </Typography>
        ) : null}
      </Typography>
      <Box
        role="list"
        aria-label={heading}
        sx={{
          display: "flex",
          gap: 1,
          overflowX: "auto",
          pb: 0.5,
          scrollbarWidth: "thin",
          scrollBehavior: reduce ? "auto" : "smooth",
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 6,
            backgroundColor: "action.hover",
          },
        }}
      >
        {items.map((item, index) => (
          <Box key={item.id} role="listitem" sx={{ flexShrink: 0 }}>
            <Button
              onClick={() => onSelect(index)}
              aria-label={item.alt}
              color="inherit"
              sx={{
                p: 0.5,
                minWidth: 0,
                borderRadius: 1.5,
                textTransform: "none",
              }}
            >
              <Box
                component="img"
                src={item.src}
                alt=""
                aria-hidden
                sx={{
                  width: thumbWidth,
                  height: Math.round(thumbWidth * 0.72),
                  objectFit: "cover",
                  borderRadius: 1,
                  display: "block",
                  bgcolor: "action.hover",
                }}
              />
            </Button>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
