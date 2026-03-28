## v67 — 2026-03-28

### Done
- Prop firm drag order persistence — Supabase load now sorts by localStorage order
- Equity curve hover tooltips on Dashboard (HTML div tooltip, no SVG text)
- Equity curve green/red split at zero line (SVG clipPath, two coloured paths)
- Tooltip + crosshair colour tracks hover point value (not final position)
- Prop Firms sparkline hover tooltips (HTML div, crosshair, hover dot)
- Theme toggle moved to header (sun/moon icon, compact, near clock)
- Theme toggle removed from settings panel
- Dark mode lightened to Windows-style greys: bg #1c1c1c, surface #252525, surfaceHigh #2e2e2e, border #3d3d3d, textMid #aaa
- Header neutral grey in both modes — blue accent removed (dark tabActiveCol → #fff, light → #000)
- NV watermarks: two ghost logos, bottom-right + top-left, 320px each, opacity 0.016
- PREP MODE weekend bar: opacity 0.45 → 0.85 (visible in dark mode)
- maxWidth 1440 → 1200
- Change password in settings — validates current, saves new hash to localStorage (nv_lock_hash)
- Review tab reordered — WeeklyReview first, Monthly Performance table at bottom
- Mindset rating — save toast confirmation added
- AI Generate notes → plain Save button (user has no API key currently — prompt preserved in code)
- Deployed v67 to GitHub Pages

### Business Decisions Made
- Sales version confirmed as next separate project after personal app complete
- Delivery: £49 one-time, Gumroad or Lemon Squeezy, ZIP (HTML + NVTemplate + setup PDF)
- Code protection: light obfuscation only (javascript-obfuscator in build.js) — no SaaS, no Electron, no license server
- Grade Model v2: confirmed NOT needed — do not build
- Macro tab candidate for return as "Market Context" panel (DXY + Forex Factory economic calendar, no paid API)

### Known Issues
- None

### Next Session
- Tablet/mobile responsive layout (768px breakpoints minimum)
- Market Context panel — DXY direction + high-impact economic calendar
- Begin planning sales version repo structure
