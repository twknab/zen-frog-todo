/**
 * Registry of in-app legal / policy documents. Add new entries here — the
 * LegalDocsDialog picks them up as a nav list without layout redesign (023).
 */

export type LegalDocId = "privacy";

export type LegalDocSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalDoc = {
  id: LegalDocId;
  title: string;
  /** Short nav label in the modal sidebar. */
  navLabel: string;
  updatedLabel: string;
  sections: LegalDocSection[];
};

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
          "If you turn on “Share anonymous visit stats” in Options → Your data, Frog Garden may load a privacy-oriented analytics script (Plausible) that records coarse, cookieless visit signals — for example that the site was opened, roughly how many unique browsers visited, and generic referrer/page information.",
          "That signal is anonymized and aggregated. It does not include your garden contents. The toggle is off by default; if you leave it off, no analytics script is loaded.",
          "If the analytics domain is not configured for a given deploy, the toggle has no effect and nothing is sent.",
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
];

export function getLegalDoc(id: LegalDocId): LegalDoc {
  const doc = LEGAL_DOCS.find((entry) => entry.id === id);
  if (!doc) throw new Error(`Unknown legal doc: ${id}`);
  return doc;
}
