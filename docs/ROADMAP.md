# NV Journal — Roadmap
> Read this before starting any new feature or making architectural decisions.
> This is the single source of truth for what's built, what's next, and what's planned.

---

## Current Version: v67
**File:** `NVJournal_source.html`
**Deployed:** `https://nvspotify0305-hub.github.io/nv-journal`
**Architecture:** Single-file pre-compiled React 18 HTML app, Supabase backend, GitHub Pages hosting.

---

## Tabs (live in v67)

| Tab | Status | Notes |
|-----|--------|-------|
| Dashboard | ✅ Live | Metrics, SessionStatsPanel, Grade breakdown, equity curve with hover tooltips |
| Trades | ✅ Live | Full trade log, search, filter, CSV export/import, Gallery view |
| Review | ✅ Live | Weekly review first, monthly performance below, Save button for notes |
| Days | ✅ Live | Daily bias journal |
| Log Trade | ✅ Live | GradePanel, confluence grader, chart image upload |
| Prop Firms | ✅ Live | Daily drawdown tracker, profit targets, phase progress, P&L log, sparkline tooltips |
| Calculator | ✅ Live | Futures/forex position sizing |
| Crypto | ✅ Live | Holdings tracker, Supabase-backed |

---

## Features Live in v67

| Feature | Notes |
|---------|-------|
| Grade Engine v1 | 0–35pts, A+/A/B/C, stored on save — never recalculated |
| Offline sync queue | Colored dot header indicator (green/amber/red) |
| ToastBar | Replaces all alert() calls |
| SessionStatsPanel | Per-session breakdown on Dashboard |
| NT trade handling | hypo_outcome W/L/BE, auto-fill, muted bracketed display |
| Chart image upload | Supabase storage bucket `trade-charts` |
| TradeDetail panel | Full edit modal with image support |
| Dark/light theme | Windows-style dark (bg #1c1c1c, neutral grey header, no blue accent). Light: cool off-white, neutral black accent. Theme toggle in header (sun/moon). |
| PWA support | Manifest, apple-mobile-web-app-capable |
| Offline-first | localStorage cache + Supabase sync |
| Lock screen | Password gate, hashed password (nv_lock_hash in localStorage), theme-aware |
| Change password | Settings panel — validates current, saves new hash |
| Theme toggle | Header icon (sun/moon) — removed from settings panel |
| Prop Firms tab | 5 firm presets, daily P&L log, 4 meters, draggable tabs (order persists), per-firm colour, consistency ring, profit factor, best/worst day, equity sparkline with hover tooltip |
| Equity curve | Green above zero / red below zero (SVG clipPath). HTML tooltip. Crosshair + dot tracks hover value colour. |
| NV Watermarks | Two ghost logos: bottom-right + top-left, 320px, opacity 0.016 |
| Gallery view | Trade image gallery in Trades tab |
| CSV export/import | Trades tab — one-click export, import from CSV |
| PREP MODE | Session-aware status bar — Live/Pre/EOD/Weekend modes, DST-aware |

---

## Removed Features (do not re-add)

| Feature | Reason |
|---------|--------|
| Macro tab | Removed permanently in v65 — unreliable free-tier stack. Candidate to return as Market Context panel (different scope) |
| AI weekly notes | Removed in v67 — user has no API key. Prompt preserved in code for future re-enable |
| Theme toggle in settings | Moved to header in v67 |

---

## Design Polish — Completed

| Item | Version | Detail |
|------|---------|--------|
| Total R dominant card | v62 | 56px hero font, tinted bg, glow shadow |
| Active tab pill | v62 | Filled accent-color pill, white text, rounded shape |
| Session Performance full-width | v62 | Removed orphan grid wrapper |
| Card hover micro-interactions | v63 | translateY(-2px) lift + shadow boost |
| Stat count-up animations | v63 | AnimatedNumber component |
| Opaque header | v63 | Solid background, shadow + border for depth |
| Dark mode readability | v67 | Windows-style greys, no pitch black, textMid lifted |
| Neutral header | v67 | Blue accent removed from header in dark + light mode |
| Equity curve interactivity | v67 | Hover tooltips, green/red split at zero |
| Watermarks | v67 | Two ghost NV logos, ghost opacity |
| maxWidth | v67 | 1440 → 1200 |

## Design Polish Queue

| Item | Detail |
|------|--------|
| Responsive/mobile breakpoints | Grid layouts for 768px+ — next sprint priority |

---

## Backlog

| Item | Priority | Notes |
|------|----------|-------|
| Tablet/mobile responsive layout | High | 768px breakpoints minimum |
| Market Context panel | Medium | DXY direction + high-impact economic calendar. Forex Factory or Twelve Data. No paid API required. |
| Prop Firms Phase 2 | Low | Calendar heatmap, phase transition workflow, consistency rule viz |
| Weekly AI notes | Low | Re-enable when user has API key — prompt already written in code |

---

## Declined (do not re-propose)

| Item | Reason | Date |
|------|--------|------|
| GradePanel full width | User declined | 2026-03-22 |
| Footer model version label | User declined | 2026-03-22 |
| Grade Model v2 | User confirmed not needed | 2026-03-28 |
| SaaS / hosted sales model | User wants buyers to self-host | 2026-03-28 |
| Electron wrapper | Not needed at £49 price point | 2026-03-28 |
| License key server | Not worth engineering cost at £49 | 2026-03-28 |

---

## Grade Model v2 — Confirmed Not Needed

> ❌ Do NOT build. User confirmed 2026-03-28. Remove from all future suggestions.

---

## Prop Firms Tab — Live in v67

| Item | Detail |
|------|--------|
| Status | Live |
| Firms | Topstep 50k, FundedNext 10k, FTMO 10k, Apex 50k, Custom |
| Features | 4 progress meters, win rate stats row, daily P&L log, phase tracker, sparkline with hover tooltip, draggable tabs (order persists across sessions) |
| Data | Supabase `prop_firms` table, localStorage `nv_propfirms_v1` |
| Phase 2 backlog | Calendar heatmap, phase transition workflow, consistency rule viz |

---

## Commercialisation — Sales Version

> Separate project from nvbuild. Do not mix with personal app changes.

| Decision | Detail |
|----------|--------|
| Price | £49 one-time |
| Platform | Gumroad or Lemon Squeezy |
| Delivery | ZIP: HTML + NVTemplate + setup PDF (Supabase + GitHub Pages guide) |
| Code protection | Light obfuscation only — javascript-obfuscator in build.js |
| Includes | NV Journal (stripped) + NVTemplate bundled as bonus |
| Grading | Optional — buyer can configure their own confluences |
| Personal data strip | Supabase URL/key, password hash, account defaults, NV branding |
| Build order | 1. Finish personal app (tablet + Market Context) → 2. New repo → 3. Strip + obfuscate → 4. Write PDF guide → 5. Gumroad listing |

**Why it sells:** PREP MODE + grading engine + prop firm compliance tracker. No direct competitor has this combination. Edgewonk £169/Tradersync £30mo are generic and aging.

**UI direction (from Stitch mockup):** Generic "JOURNAL" branding (configurable), Analytics dedicated tab, subtle animated dot-grid background, cleaner dashboard hierarchy. Analytics tab is the key differentiator to build for v1 sales.

---

## NV Template — Separate App

| Item | Detail |
|------|--------|
| File | Standalone HTML (separate from NV Journal) |
| Purpose | Chart composition tool, social media export (PNG/clipboard) |
| Status | Active — included as bonus in sales version |
| Theme | Dark/light mode, syncs with NV Journal via nv_theme localStorage |

---

## Version History

| Version | Notes |
|---------|-------|
| v67 | Dark mode Windows-style greys, neutral header (no blue), watermarks, equity curve tooltips + green/red split, theme toggle in header, change password in settings, Review tab reorder (weekly first), drag order persistence, mindset toast, Save button replaces AI notes |
| v66 | Header redesign (Obsidian+blue dark / off-white+navy light), prop firms firm colours + draggable tabs, new stats row (consistency, profit factor, best/worst day, equity sparkline), streak badge |
| v65 | RR tracker (4th meter), win rate, trade count, FundedNext rules fix, Topstep import |
| v64 | Prop Firms tab: full dashboard, 5 firm presets, daily P&L log, drawdown/profit meters |
| v63 | Lock screen, opaque header, label tightening, empty state icons, 30s render fix |
| v62 | Total R hero card, active tab pill, session performance full-width fix |
| v61 | UI polish pass (contrast, skeletons, tooltips, blur) |
| v60 | Previous stable |

---

## Deployment Rules

- Bump footer string on every build: `"NV JOURNAL - vXX"`
- Working file: `NVJournal_source.html`
- Deploy: `node build.js` → `git add` → `git commit -m "vXX"` → `git push origin master:main`
- Branch: local `master` → remote `main`
- Do NOT deploy without explicit user instruction ("deploy", "push", "go live")
