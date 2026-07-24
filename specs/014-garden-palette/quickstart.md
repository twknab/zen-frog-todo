# Quickstart: Garden Palette Selector

## Prerequisites

```bash
npm install
npm run dev
```

Open the local app URL. Gate commands:

```bash
npx tsc --noEmit
npx eslint . --max-warnings=0
```

## Manual scenarios

### 1. Default is Natural

1. Clear site localStorage (or use a fresh profile).
2. Load the app.
3. **Expect**: muted parchment/moss look (not neon violet); heading face is calm Zen Maru Gothic; wordmark is solid (not gradient).

### 2. Options hosts Palette, Appearance, Dev

1. Confirm header has **no** sun/moon button and **no** Dev switch.
2. Click **Options** (settings icon).
3. **Expect**: Popover with Palette (Natural / Vibrant / Dusk), Appearance (Light / Dark), and Dev switch.

### 3. Switch palettes

1. Open Options → Vibrant.
2. **Expect**: neon garden colors; Bricolage headings; gradient wordmark; Popover still open.
3. Select Dusk.
4. **Expect**: indigo/violet/gold calm night-garden; solid wordmark; moss/green still present; Popover still open.
5. Select Natural → muted restoration.

### 4. Orthogonal Appearance

1. On Natural + Dark, switch Appearance to Light — palette stays Natural.
2. Switch to Vibrant, then Dark — stays Vibrant dark.
3. Repeat for Dusk. **Expect**: six readable combinations; no axis resets the other.

### 5. Persistence

1. Set Vibrant + Light + Dev on.
2. Reload.
3. **Expect**: Vibrant, Light, Dev still on; Dev tools visible when applicable.

### 6. Accessibility smoke

1. Tab to Options, Enter/Space to open.
2. Tab through Palette / Appearance / Dev; change with keyboard.
3. Escape / click-away closes Popover without resetting preferences.
4. Screen reader (or accessibility tree): Options, Palette, Appearance, Dev named.

### 7. Invalid palette guard

1. In DevTools, set `frog-garden:palette-v1` to `"neon"`.
2. Reload.
3. **Expect**: Natural (no crash, no error toast).
