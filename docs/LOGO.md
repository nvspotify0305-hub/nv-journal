# NV Logo — Spec Reference
> Read this before touching the logo in NVJournal, NV Template, or any canvas/SVG work.
> The logo has two implementations: SVG React component and Canvas renderer. Rules differ.

---

## Visual Design

Circle containing:
- **N** (left) — two vertical bars connected by a diagonal
- **|** (centre) — vertical dividing line with a dot below (exclamation mark style)
- **V** (right) — two diagonal strokes meeting at a point

Appears as `N|V` inside a circle. Light mode: black on white. Dark mode: white on black.

---

## SVG Spec (viewBox 0 0 200 200)

### Bounding Box
```
viewBox: "0 0 200 200"
fill: "none"
```

### Background rect (required for opacity)
```
<rect width="200" height="200" fill={bg} />
```
- `bg` = `#fff` (light) or `#000` (dark)

### Circle
```
<circle cx="100" cy="100" r="88" fill="none" stroke={ink} strokeWidth="5.5" />
```

### Centre divider line (the | )
```
<line x1="100" y1="42" x2="100" y2="148" stroke={ink} strokeWidth="4.5" strokeLinecap="round" />
```

### Centre dot (bottom of | )
```
<circle cx="100" cy="159" r="5" fill={ink} />
```

### N — left vertical bar
```
<rect x="30" y="58" width="10" height="72" rx="1" fill={ink} />
```

### N — right vertical bar
```
<rect x="80" y="58" width="10" height="72" rx="1" fill={ink} />
```

### N — diagonal connector
```
<polygon points="30,58 40,58 90,130 80,130" fill={ink} />
```

### V — left stroke
```
<polygon points="110,58 121,58 143,124 132,124" fill={ink} />
```

### V — right stroke
```
<polygon points="158,58 169,58 147,124 136,124" fill={ink} />
```

---

## Colour Logic

| Mode | ink | bg |
|------|-----|----|
| Light | `#000` | `#fff` |
| Dark | `#fff` | `#000` |

For favicon/apple-touch-icon (static, no dark mode):
- Stroke/fill: `#000`
- No bg rect needed for favicon (transparent)
- Apple touch icon: add `<rect width="200" height="200" fill="#fff"/>` as first element

---

## React Component (NVJournal)

```javascript
function NVLogo({ size = 34, isDark, onClick }) {
  const ink = isDark ? "#fff" : "#000";
  const bg  = isDark ? "#000" : "#fff";
  // ... SVG as above
}
```

- Default size: `34px`
- `onClick` prop: makes cursor pointer when provided
- Defined **outside** main component body — never move inside

---

## Canvas Rendering (NV Template)

Canvas uses pixel coordinates mapped from SVG viewBox (0 0 200 200).

### Scale factor
```javascript
const s = size / 200;  // size = canvas dimension in px
```

### Coordinate mapping
```javascript
// SVG coord → canvas coord
x_canvas = svgX * s
y_canvas = svgY * s
```

### Line width
```javascript
ctx.lineWidth = 5.5 * s;  // for circle stroke
```

> ⚠️ **Critical:** Do NOT use `ctx.scale(s, s)` — it double-scales `lineWidth`.
> Map coordinates manually using `s` as above.

### Canvas draw order
1. Background rect fill
2. Circle stroke
3. Centre line (| )
4. Centre dot
5. N left bar (fillRect)
6. N right bar (fillRect)
7. N diagonal (polygon path)
8. V left stroke (polygon path)
9. V right stroke (polygon path)

---

## Favicon (inline SVG data URI)

Used in `<link rel="icon">`:
```
data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E
%3Ccircle cx='100' cy='100' r='88' fill='none' stroke='%23000' stroke-width='5.5'/%3E
%3Cline x1='100' y1='42' x2='100' y2='148' stroke='%23000' stroke-width='4.5' stroke-linecap='round'/%3E
%3Ccircle cx='100' cy='159' r='5' fill='%23000'/%3E
%3Crect x='30' y='58' width='10' height='72' rx='1' fill='%23000'/%3E
%3Crect x='80' y='58' width='10' height='72' rx='1' fill='%23000'/%3E
%3Cpolygon points='30,58 40,58 90,130 80,130' fill='%23000'/%3E
%3Cpolygon points='110,58 121,58 143,124 132,124' fill='%23000'/%3E
%3Cpolygon points='158,58 169,58 147,124 136,124' fill='%23000'/%3E
%3C/svg%3E
```

Apple touch icon adds white background rect as first element.

---

## What Claude Code Must Never Do

- Change polygon points without explicit instruction — any shift breaks the N or V shape
- Use `ctx.scale()` in canvas rendering — causes double-scaled lineWidth
- Redefine NVLogo inside the main NVJournal component body — causes remount on every state change
- Use different stroke widths than specified (circle: 5.5, divider line: 4.5)
- Merge NV Template logo canvas logic into NV Journal SVG component
