import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/**
 * Calm, minimal site footer — privacy link plus a small maker credit.
 * Shared across every route via the root layout.
 */
export default function Footer() {
  return (
    <Stack
      component="footer"
      spacing={1}
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 2, md: 3 },
        pb: { xs: 3, md: 4 },
        pt: 1,
        alignItems: "center",
      }}
    >
      <Divider sx={{ width: "100%", maxWidth: 320, borderColor: "divider", opacity: 0.6 }} />
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}
      >
        <Link
          href="/privacy"
          variant="caption"
          underline="hover"
          color="text.secondary"
        >
          Privacy Policy
        </Link>
        <Typography variant="caption" color="text.disabled" aria-hidden>
          ·
        </Typography>
        <Link
          href="https://timknab.dev"
          target="_blank"
          rel="noopener noreferrer"
          variant="caption"
          underline="hover"
          color="text.secondary"
        >
          ⚡️ by TK & Ty
        </Link>
      </Stack>
    </Stack>
  );
}
