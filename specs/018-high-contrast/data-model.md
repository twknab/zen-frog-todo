# Data Model: High Contrast Toggle

**Feature**: `018-high-contrast` | **Date**: 2026-07-25

## Entities

### HighContrastPreference

| Field | Type | Storage | Default | Notes |
|-------|------|---------|---------|-------|
| enabled | `boolean` | `localStorage` key `frog-garden:high-contrast-v1` | `false` | Via `usePersistentState` |

**Invariants**:

- Unknown / corrupted stored value → treat as `false`.
- Toggling never mutates `frog-garden:palette-v1` or `frog-garden:color-mode-v1`.

### HighContrastTheme (`highContrast`)

Not persisted as a palette choice. Runtime-only override:

| Variant | Surfaces | Text | Primary (moss) | Atmosphere |
|---------|----------|------|----------------|------------|
| light | near-white paper/default | near-black ink | HC-safe green meeting AA on light chrome | flat / low wash |
| dark | near-black paper/default | near-white ink | HC-safe green meeting AA on dark chrome | flat / low wash |

### Related existing entities (unchanged)

| Entity | Key | Interaction with HC |
|--------|-----|---------------------|
| Palette preference | `frog-garden:palette-v1` | Preserved; ignored visually while HC on |
| Color mode | `frog-garden:color-mode-v1` | Still drives which HC variant applies |

## State transitions

```text
HC off + palette P + mode M  →  createZenTheme(M, P)
toggle HC on                 →  createHighContrastTheme(M)  // P stored unchanged
toggle Appearance to M'      →  createHighContrastTheme(M') // still HC
toggle HC off                →  createZenTheme(M', P)       // restore P
```
