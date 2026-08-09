/**
 * Registry of in-app legal / about documents. Add new entries here — the
 * LegalDocsDialog picks them up as a nav list without layout redesign (023).
 */

export type LegalDocId = "privacy" | "about";

export type LegalDocSection = {
  heading: string;
  paragraphs: string[];
  /** Optional outbound links shown after the paragraphs */
  links?: { label: string; href: string }[];
};

export type LegalDoc = {
  id: LegalDocId;
  title: string;
  /** Short nav label in the modal sidebar. */
  navLabel: string;
  updatedLabel: string;
  sections: LegalDocSection[];
};

export const ISSUES_BOARD_URL =
  "https://github.com/twknab/zen-frog-todo/issues";

export const LEGAL_DOCS: LegalDoc[] = [
  {
    id: "privacy",
    title: "Privacy Policy",
    navLabel: "Privacy",
    updatedLabel: "Updated August 2026",
    sections: [
      {
        heading: "Private by design",
        paragraphs: [
          "Frog Garden is a local-first app. Your tasks, notes, reflections, garden state, and settings live only in this browser, on this device. There is no account and no server that stores your garden.",
          "Clearing site data for this origin will erase what you have stored here. Export a backup from Options whenever something is worth keeping.",
        ],
      },
      {
        heading: "What never leaves your device",
        paragraphs: [
          "We do not upload or sync your task titles, list contents, notepad bodies, day reflections, focus history, sand drawings, or bonsai state to any server. Those stay in browser storage unless you export them yourself.",
        ],
      },
      {
        heading: "Optional anonymous visit metrics",
        paragraphs: [
          "If you turn on “Share anonymous visit stats” in Options → Your data, Frog Garden can send simple, cookieless visit signals (for example that the app was opened, and rough unique-visitor counts). These help us understand how the product is used and what to improve.",
          "They are anonymized and aggregated. Your garden contents are never included. The toggle is off by default — leave it off and nothing is sent.",
        ],
      },
      {
        heading: "Exports and backups",
        paragraphs: [
          "When you export a backup (JSON or spreadsheet), the file is created in your browser and saved to your device. You choose where it goes.",
        ],
      },
      {
        heading: "Questions",
        paragraphs: [
          "This policy may grow as we add related notices (for example terms of use). The garden’s promise stays the same: your lists and notes are yours, on your machine, unless you opt into anonymous visit stats.",
        ],
      },
    ],
  },
  {
    id: "about",
    title: "About Frog Garden",
    navLabel: "About",
    updatedLabel: "A calm place to swallow the frog first",
    sections: [
      {
        heading: "What this is",
        paragraphs: [
          "Frog Garden is not a Jira replacement. It is a minimal pointer to your most important task — the frog — so you have a single focus while other tools hold the granular details.",
          "Use it for coarse management of larger workflows: pick what matters today, finish it, let the garden grow. Incomplete days are never framed as failure.",
        ],
      },
      {
        heading: "How we think about it",
        paragraphs: [
          "Calm technology: generous space, gentle motion, no shame UI, no “you’re behind” language.",
          "Local-first and private: your garden lives on this device unless you export it or opt into anonymous visit stats.",
          "Subtle gamification: a bonsai and critters that respond to real work — not scoreboards or leaderboards.",
        ],
      },
      {
        heading: "Feature requests",
        paragraphs: [
          "We welcome ideas. If something would help your garden, you’re invited to open an issue on our board.",
        ],
        links: [{ label: "Open the issues board", href: ISSUES_BOARD_URL }],
      },
    ],
  },
];

export function getLegalDoc(id: LegalDocId): LegalDoc {
  const doc = LEGAL_DOCS.find((entry) => entry.id === id);
  if (!doc) throw new Error(`Unknown legal doc: ${id}`);
  return doc;
}
