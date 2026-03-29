# NV Journal — Roadmap
> Read this before starting any new feature or making architectural decisions.
> This is the single source of truth for what's built, what's next, and what's planned.

---

## Current Version: v70
**File:** `NVJournal_source.html`
**Deployed:** `https://nvspotify0305-hub.github.io/nv-journal`
**Architecture:** Single-file pre-compiled React 18 HTML app, Supabase backend, GitHub Pages hosting.

---

## Tabs (live in v70)

| Tab | Status | Notes |
|-----|--------|-------|
| Dashboard | ✅ Live | Metrics, SessionStatsPanel, Grade breakdown, equity curve with hover tooltips |
| Trades | ✅ Live | Full trade log, search, filter, CSV export/import, Gallery view |
| Review | ✅ Live | Weekly review first, monthly performance below, Save button for notes |
| Days | ✅ Live | Daily bias journal, WeeklyTrend chart, analytics row (BiasEngine + DowChart + WeeklyTrend) |
| Log Trade | ✅ Live | GradePanel, confluence grader, chart image upload |
| Macro | ✅ Live | Live prices, risk sentiment, FF calendar, MyFxBook retail sentiment, COT live (CFTC) |
| Prop Firms | ✅ Live | Daily drawdown tracker, profit targets, phase progress, P&L log, sparkline tooltips |
| Calculator | ✅ Live | Futures/forex position sizing |
| Crypto | ✅ Live | Holdings tracker, Supabase-backed |

---

## Features Live in v70

| Feature | Version | Notes |
|---------|---------|-------|
| Grade Engine v1 | v60 | 0–35pts, A+/A/B/C, stored on save — never recalculated |
| Offline sync queue | v60 | Colored dot header indicator (green/amber/red) |
| ToastBar | v60 | Replaces all alert() calls |
| SessionStatsPanel | v60 | Per-session breakdown on Dashboard |
| NT trade handling | v60 | hypo_outcome W/L/BE, auto-fill, muted bracketed display |
| Chart image upload | v60 | Supabase storage bucket `trade-charts` |
| TradeDetail panel | v60 | Full edit modal with image support |
| Dark/light theme | v67 | Windows-style dark (bg #1c1c1c, neutral grey header). Light: cool off-white, neutral black accent. |
| PWA support | v60 | Manifest, apple-mobile-web-app-capable |
| Offline-first | v60 | localStorage cache + Supabase sync |
| Lock screen | v63 | Password gate, hashed password (nv_lock_hash), theme-aware, dot-grid background |
| Change password | v67 | Settings panel — validates current, saves new hash |
| Theme toggle | v67 | Header icon (sun/moon) |
| Prop Firms tab | v64 | 5 firm presets, daily P&L log, 4 meters, draggable tabs, sparkline tooltip, equity sparkline |
| Equity curve | v67 | Green above zero / red below zero (SVG clipPath). HTML tooltip. Crosshair tracks hover. |
| NV Watermarks | v67 | Two ghost logos: bottom-right + top-left, 320px, opacity 0.016 |
| Gallery view | v67 | Trade image gallery in Trades tab |
| CSV export/import | v67 | Trades tab — one-click export, import from CSV |
| PREP MODE | v67 | Session-aware status bar — Live/Pre/EOD/Weekend modes, DST-aware |
| Responsive layout | v68 | 768px+ breakpoints, mobile grid collapse, scrollable nav, footer cleanup |
| Dot-grid background | v69 | 24px spacing, mouse parallax, two-pass canvas render. Lock screen + main app. |
| Review reset fix | v69 | useEffect deps extracted to primitives — no more reset on 30s sync |
| Days analytics row | v69 | BiasEngine + DowChart + WeeklyTrend in equal-height horizontal row |
| WeeklyTrend chart | v69 | 8-week bias accuracy SVG polyline with area fill |
| Macro tab (live) | v69 | Prices, risk sentiment, FF calendar (with actuals), MyFxBook sentiment, COT mockup |
| MyFxBook in Settings | v69 | Email + password fields, Save button, session token cached in localStorage |
| COT live data | v70 | CFTC API — EUR/GBP non-commercial net positioning, WoW change, 24hr cache |

---

## Removed Features (do not re-add)

| Feature | Reason |
|---------|--------|
| AI weekly notes | Removed in v67 — user has no API key. Prompt preserved in code for future re-enable |
| Theme toggle in settings | Moved to header in v67 |
| Alpha Vantage / Cloudflare Worker macro | Replaced by direct API calls in v69 Macro tab |

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
| Responsive layout | v68 | Mobile-first grid collapse, 768px breakpoint |
| Dot-grid interactive background | v69 | Mouse parallax, canvas two-pass render, lock screen + main app |

---

## Backlog

| Item | Priority | Notes |
|------|----------|-------|
| MyFxBook live test | Medium | Verify credentials + sentiment display on live site after v70 deploy |
| Sales version repo | Medium | Separate repo — strip personal data, obfuscate, Gumroad listing |
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
| Performance heatmap (Macro) | User declined | 2026-03-28 |
| Bias log in Macro tab | Already handled in Days tab | 2026-03-28 |
| Manual risk on/off toggle | Replaced by auto-derived sentiment | 2026-03-28 |

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
| Build order | 1. Finish personal app (COT + MyFxBook test) → 2. New repo → 3. Strip + obfuscate → 4. Write PDF guide → 5. Gumroad listing |

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
| v70 | COT live data (CFTC API), MyFxBook CORS confirmed |
| v69 | Macro tab live (frankfurter.app + gold-api + FF calendar + MyFxBook), dot-grid background (main + lock screen), Review reset fix, Days analytics row (WeeklyTrend), calendar shows actuals after event fires, MyFxBook credentials in Settings, Log Trade tab restored after accidental deletion |
| v68 | Responsive layout (768px+), mobile grid collapse, scrollable nav, footer cleanup |
| v67 | Dark mode Windows-style greys, neutral header, watermarks, equity curve tooltips + green/red split, theme toggle in header, change password in settings, Review tab reorder, mindset toast, Save button replaces AI notes |
| v66 | Header redesign, prop firms firm colours + draggable tabs, new stats row, streak badge |
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
