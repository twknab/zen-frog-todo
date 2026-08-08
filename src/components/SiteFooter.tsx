"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { useState } from "react";
import LegalDocsDialog from "@/components/LegalDocsDialog";

/**
 * Calm center footer with a Privacy Policy affordance. Hover/focus grows a soft
 * underline; click opens the scalable legal modal (023 / #41).
 */
export default function SiteFooter() {
  const [legalOpen, setLegalOpen] = useState(false);

  return (
    <>
      <Box
        component="footer"
        sx={{
          mt: { xs: 4, md: 5 },
          pt: 2,
          pb: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ButtonBase
          onClick={() => setLegalOpen(true)}
          aria-haspopup="dialog"
          sx={{
            position: "relative",
            px: 1,
            py: 0.5,
            borderRadius: 1,
            typography: "caption",
            letterSpacing: "0.04em",
            color: "text.secondary",
            fontWeight: 500,
            transition: "color 180ms ease",
            "&::after": {
              content: '""',
              position: "absolute",
              left: "50%",
              right: "50%",
              bottom: 2,
              height: 1.5,
              borderRadius: 1,
              bgcolor: "primary.main",
              opacity: 0,
              transition:
                "left 220ms ease, right 220ms ease, opacity 180ms ease",
            },
            "&:hover, &:focus-visible": {
              color: "text.primary",
              "&::after": {
                left: 8,
                right: 8,
                opacity: 1,
              },
            },
          }}
        >
          Privacy Policy
        </ButtonBase>
      </Box>

      <LegalDocsDialog
        key={legalOpen ? "legal-open" : "legal-closed"}
        open={legalOpen}
        onClose={() => setLegalOpen(false)}
      />
    </>
  );
}
