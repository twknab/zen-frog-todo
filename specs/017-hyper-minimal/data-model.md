# Data Model: Hyper Minimal Mode

## Hyper Minimal preference

| Field | Type | Default | Persistence |
|---|---|---|---|
| enabled | boolean | `false` | localStorage key `frog-garden:hyper-minimal-v1` |

### Rules

- Missing / unreadable value → treat as `false`.
- Orthogonal to palette (`frog-garden:palette-v1`), appearance (`frog-garden:color-mode-v1`), and Dev (`frog-garden:dev-mode-v1`).
- Single value applies to both Flow and Focus dashboard modes.
- No server sync; no account association.

### Relationships

- Consumed by OptionsPanel (read/write) and dashboard chrome consumers (read).
- Does not mutate tasks, bonsai, sand, grove, or notepad data.
