import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CloudOffOutlinedIcon from "@mui/icons-material/CloudOffOutlined";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Frog Garden",
  description: "How Frog Garden handles your data: nothing leaves your device.",
};

/**
 * Static privacy policy. Kept in plain language and short on purpose — the
 * actual practice (everything on-device, nothing sent anywhere) doesn't need
 * legalese to explain. See constitution Principle III (Local-First & Private).
 */
export default function PrivacyPolicyPage() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        maxWidth: 720,
        mx: "auto",
        px: { xs: 2, md: 3 },
        py: { xs: 4, md: 6 },
      }}
    >
      <Link
        href="/"
        underline="hover"
        color="text.secondary"
        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mb: 4 }}
      >
        <ArrowBackOutlinedIcon fontSize="small" />
        Back to Frog Garden
      </Link>

      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 3 }}>
        <CloudOffOutlinedIcon aria-hidden sx={{ color: "text.secondary" }} />
        <Typography variant="h4" component="h1">
          Privacy Policy
        </Typography>
      </Stack>

      <Stack spacing={3}>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          Frog Garden is built to be private by default. Here&rsquo;s exactly what
          that means, in plain language.
        </Typography>

        <Section title="Nothing leaves your device">
          Your tasks, notes, garden, and settings are stored only in this
          browser, on this device (via localStorage). There is no account, no
          server, and no database on our end &mdash; we never see what you write,
          because it&rsquo;s never sent to us. The app works fully offline.
        </Section>

        <Section title="No tracking, no analytics">
          We don&rsquo;t run third-party analytics, ad trackers, or session
          recording. If that ever changes, it will be an explicit, off-by-default
          opt-in &mdash; never silent, and never anything beyond coarse, anonymous
          counts (never your task text or notes).
        </Section>

        <Section title="Clearing your browser data erases it">
          Because everything lives in browser storage, clearing your cache or
          site data for Frog Garden deletes it &mdash; there&rsquo;s no cloud copy
          to restore from. If something&rsquo;s worth keeping, export a backup
          from Options from time to time.
        </Section>

        <Section title="Your notes are ephemeral by design">
          The notepad is meant for quick, in-the-moment thoughts around your
          tasks &mdash; not long-term storage. For documents you want to keep,
          use a dedicated notes app and export/import here as needed.
        </Section>

        <Section title="Exporting and importing">
          You can export a full backup (JSON or Excel) at any time from
          Options. JSON is the re-importable format if you ever need to
          restore your data into the app.
        </Section>

        <Section title="Changes to this policy">
          If our practices ever change &mdash; including adding any opt-in
          analytics &mdash; this page will be updated to reflect it plainly,
          with no retroactive surprises.
        </Section>
      </Stack>
    </Box>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box component="section">
      <Typography variant="h6" component="h2" sx={{ mb: 0.75 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
        {children}
      </Typography>
    </Box>
  );
}
