# Export Contract: Persistent Notepad

## Full export (`kind: "full"`)

Extends the existing full-dump document from `dayArchive.ts`.

```ts
type FullExport = {
  schemaVersion: 1;
  exportedAt: string; // ISO-8601
  kind: "full";
  archive: ArchivedDay[]; // unchanged — no notepad on days
  live: {
    tasks: Task[];
    frogTaskId: string | null;
    completedLog: CompletedLogEntry[];
    reflection: string; // mental-health token — unchanged
    focusSessions: number;
    bonsai: { leaves: number; stage: string };
  };
  notepad: string; // NEW — persistent eng notepad markdown source
};
```

### Rules

- `buildFullExport` / `useExportEverything` MUST include current `frog-garden:notepad-v1` value (may be `""`).
- Field is **top-level**, not nested under `live` or `archive[]` (avoids implying day-scoped lifetime).
- Readers MUST treat missing `notepad` as `""` (older exports).
- `schemaVersion` remains `1`; additive field only.

## Single-day export (`kind: "day"`)

**Unchanged.** Must not embed the ongoing notepad.

```ts
type SingleDayExport = {
  schemaVersion: 1;
  exportedAt: string;
  kind: "day";
  day: ArchivedDay; // includes reflection, not notepad
};
```

## Day archive boundary

- `ArchivedDay` MUST NOT gain a notepad field for this feature.
- `useStartNewDay` / auto-rollover MUST NOT clear `frog-garden:notepad-v1`.
