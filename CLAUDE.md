# CLAUDE.md — NV Journal Project

> Claude Code context file. Read this before touching any file in this repo.

---

## 1. Project Purpose

**NV Journal** is a high-performance, single-operator trading dashboard built for the NV-System — a proprietary ICT/SMC-based methodology trading EURUSD and GBPUSD across three Dublin sessions daily.

It is **not** a generic trading journal. Every UI decision, grading rule, and data field maps directly to NV-System mechanics.

**Secondary app in this repo:** `NVTemplate.html` — a standalone chart composition tool for annotated multi-timeframe layouts, deployed at `/template`.

**Live URL:** `https://nvspotify0305-hub.github.io/nv-journal`

---

## 2. Tech Stack

| Layer | Implementation |
|---|---|
| Frontend | Single-file HTML — pre-compiled React 18 (UMD, no JSX source) |
| Styling | Inline CSS-in-JS via `ThemeCtx` — no stylesheet files |
| State | React `useState` + `useEffect` — no Redux, no Zustand |
| Persistence | Supabase (primary) + `localStorage` (fallback/cache) |
| Auth | None — single-user, anon Supabase key |
| Hosting | GitHub Pages (`master` → `main` branch) |
| Macro data | Cloudflare Worker (`nv-macro`) — proxies FF Calendar, FRED yields, Yahoo VIX, ECB Bund, Finnhub ETFs. Worker code: `docs/worker-nv-macro.js` |
| Build tool | `node build.js` in project root — copies pre-compiled file to `index.html` |
| Framework | React 18 via CDN (`unpkg.com/react@18/umd/react.production.min.js`) |

**Critical architecture constraints:**
- The `.html` file is the **compiled output**, not a source file. There is no JSX, no Babel config, no `src/` directory.
- `NVJournal_source.html` = the versioned working file. `index.html` = what GitHub Pages serves.
- `build.js` detects pre-compiled files and copies directly — it does **not** transpile.
- All UI primitives (`Card`, `CardElevated`, `GradeBadge`, `Sect`, `Fld`, `Chk`, `Tog`, `Stat`) are declared as `function` declarations **outside** the main `NVJournal` component. Never move them inside — they will remount on every render.
- `gradeDisplay` is debounced 300ms from `gradeResult` to prevent jank on rapid input changes.
- All `<button>` elements must have `type="button"` — no implicit form submission.
- Single `<script>` tag in the HTML body — no `type="text/babel"`.

---

## 3. NV-System Core Logic

### Sessions (Dublin / IST time)
| Session | Time (Dublin) | Notes |
|---|---|---|
| London Open | 07:00 | Primary |
| New York Open | 12:00 (11:00 pre-DST) | Primary |
| London Close / NY Afternoon | 15:00 | Secondary |

DST state is tracked via `nv_dst` (localStorage). UI has a toggle. All session times shift by ±1hr depending on DST state.

### Instruments
- **EURUSD**, **GBPUSD** only. No other pairs.

### Candle Sequencing: C1–C5+
| Label | Role | Tradeable |
|---|---|---|
| C1 | Displacement / Expansion candle — establishes direction | No |
| C2 | First retracement into C1 range — primary entry | Yes |
| C3 | Second retracement — valid if C2 did not deliver | Yes |
| C4 | Third retracement — valid with strong confluence only | Yes |
| C5+ | Over-extended sequence — observation only, never trade | **Hard block** |

**Rule:** C5+ trades are graded **B** regardless of all other confluence. This is a hard system constraint, not a UI preference.

### Liquidity Sweeps
A sweep is a wick or close beyond a prior swing high/low that raids liquidity before reversing.

- **Sweep H4:** Price sweeps a higher-timeframe H4 swing point. Worth **4pts** in grade model v2.
- **Sweep H1:** Price sweeps an H1 swing point within the session. Worth **4pts** in grade model v2.
- **Dual Sweep:** Both H4 and H1 swept — required for A+ grade alongside other conditions.
- At least one sweep **or** one SMT signal is required for the trade to be gradeable at all (hard block if neither present).

### CISD (Change in State of Delivery)
A shift in order flow — price breaks and closes beyond a prior swing on the relevant timeframe, confirming directional intent.

- **CISD H1:** Required for A grade and above. Worth **3pts** in grade model v2.
- **CISD H4:** Bonus confluence. Worth **1pt** in grade model v2.
- CISD is distinct from a sweep — a sweep takes liquidity; a CISD confirms the new direction.

### SMT (Smart Money Technique / Divergence)
Inter-pair divergence between EURUSD and GBPUSD. When one pair makes a new swing high/low and the correlated pair fails to confirm, it signals institutional positioning.

- **SMT H4:** Divergence on the H4 timeframe. Worth **3pts** in grade model v2.
- **SMT H1:** Divergence on H1. Also **3pts**.
- SMT counts as a qualifying signal in place of a sweep for the hard-block gate.

### PSP (Power of 3 / Presumed Stop hunt Pattern)
The ICT Power of 3 concept: Accumulation → Manipulation → Distribution within a session. PSP confirms the manipulation phase has completed and distribution is beginning.

- Worth **1pt** baseline in grade model v2.
- Worth **2pts** if no sweeps are present (compensatory weight).

### HTF Alignment
Multi-timeframe directional bias must align with trade direction.

- **Daily bias aligned:** +2pts
- **H4 bias aligned:** +2pts
- **H1 bias aligned:** +1pt (also a hard requirement for any tradeable grade)

**H1 bias conflict = hard block.** Trade cannot grade above B if H1 bias opposes trade direction.

### Key Zone
Price is trading at/from a significant higher-timeframe order block, FVG, or liquidity void. Required for A grade and above. Worth **2pts**.

### H1 Market Phase
| Phase | Grade Bonus |
|---|---|
| Expansion | +2pts |
| Continuation | +1pt |
| Manipulation | 0pts |
| Consolidation | 0pts |

### Grade Model v2 — Score 0–20

**Hard blocks (any one = non-tradeable or B-cap):**
- C5+ candle sequence → grade capped at B, no exceptions
- H1 bias conflict → grade capped at B
- No sweep AND no SMT → grade capped at B

**Scoring table:**

| Signal | Points |
|---|---|
| Sweep H4 | 4 |
| Sweep H1 | 4 |
| SMT (H4 or H1) | 3 |
| CISD H1 | 3 |
| PSP (with sweeps) | 1 |
| PSP (no sweeps) | 2 |
| HTF Daily aligned | 2 |
| HTF H4 aligned | 2 |
| HTF H1 aligned | 1 |
| Key Zone | 2 |
| Displacement present | 1 |
| CISD H4 | 1 |
| Discount/Premium | 1 |
| H1 Phase: Expansion | +2 |
| H1 Phase: Continuation | +1 |

**Grade thresholds:**

| Grade | Condition |
|---|---|
| A+ | ≥14pts AND dual sweep AND CISD H1 AND Key Zone |
| A | ≥9pts AND CISD H1 AND Key Zone AND (one sweep OR SMT) |
| B | All else — tradeable but low quality, flagged in UI |

> **Grade model v1 is currently live in the app.** v2 is the next build phase. Stored grades from v1 must **not** be recalculated retroactively — trust stored grade values as-is.

### Execution Rules
- Only A+ and A trades are executed.
- B trades are logged for review only.
- TP = fixed 2R.
- SL = structure-based, set at entry.
- Break-even only after first objective hit.
- No partial closes before first objective.

---

## 4. Supabase Schema

**Project URL:** `https://sskklvnfmclmfuqpkcpt.supabase.co`
**Auth:** Anon key (public, stored in app). Single-user, no row-level auth.

Tables: `trades`, `days`, `crypto`, `prop_firms` — all use `id` + `data jsonb` pattern.
Storage bucket: `trade-charts` (public) — chart image uploads from Log Trade tab.
Weekly mindset rows use deterministic IDs: `wr_` + weekKey — prevents duplicate rows on re-render.

> Full schema, field definitions, localStorage keys, sync queue, and SQL: **`docs/SUPABASE.md`**

---

## 5. localStorage Keys

Key cache keys: `nv_trades_v5`, `nv_days_v2`, `nv_crypto_v2`, `nv_propfirms_v1`, `nv_macro_v1`, `nv_theme`, `nv_dst`, `nv_tz`.
**Version suffixes must be bumped on schema changes** — old cache won't auto-migrate.

> Full key list: **`docs/SUPABASE.md`**

---

## 6. Cloudflare Worker — `nv-macro`

**Worker URL:** `https://nv-macro.nv-trading23.workers.dev`

- Proxies Forex Factory (CORS-blocked from GitHub Pages)
- Routes: `/mfxbook-login` (kept, login still works), `/ff-calendar`
- `/mfxbook-outlook` removed — retail sentiment now sourced from CFTC directly (no Worker)
- App calls Worker directly — never calls these APIs from browser
- App-side cache: `nv_macro_v1` localStorage — prices 30min TTL, calendar 4hr, sentiment 1hr

---

## 7. Build & Deploy Commands

```bash
# Working directory
cd C:\Users\creditcontrol\nvbuild

# Build — copies NVJournal_source.html → index.html
node build.js

# Version archive (increment vXX manually)
copy index.html archive\NVJournal_v52.html

# Deploy
git add index.html
git commit -m "v52 — description of changes"
git push origin master:main
```

> Branch note: local is `master`, remote is `main`. Always push as `master:main`.
> After push: wait ~2 min, then hard refresh with `Ctrl+Shift+R`.

**Local preview (no build server required):**
```bash
# Python (if available)
python -m http.server 8080

# Node (if available)
npx serve .
```

Open `http://localhost:8080` — the app is fully self-contained, no API calls blocked by CORS in local mode (Supabase calls work directly).

---

## 8. Color Palette

Always use `C.xx` theme tokens — never hardcode hex values. Dark mode: `bg #1c1c1c`, `surface #252525`, `green #3dd68c`, `red #f06464`, `blue #60a5fa`, `yellow #fbbf24`. Light mode: `bg #f0f0f0`, `surface #fff`.

> Full token table (dark + light): **`docs/FRONTEND_DESIGN.md`**

---

## 9. NV Logo Spec

SVG `viewBox="0 0 200 200"`. React component `NVLogo` must be defined **outside** main component body.
Do NOT use `ctx.scale()` in canvas rendering — double-scales lineWidth.

> Full SVG coordinates, polygon points, canvas renderer, favicon URI: **`docs/LOGO.md`**

---

## 10. Active Sprint

**Current version: v72**

| Phase | Status | Description |
|---|---|---|
| Phase 2 | ❌ Cancelled | Grade Model v2 — confirmed not needed (2026-03-28). Do NOT build. |
| Phase 3 | Pending | Persistent status bar |
| Phase 4 | Pending | Pre-session morning brief |
| Phase 10 | Pending | Sales version — separate repo, strip personal data, light obfuscation, bundle NVTemplate, Gumroad £49 |

> Full feature history, backlog, declined items, version log: **`docs/ROADMAP.md`**

---

## 11. Macro Tab — Live (v72) / Rebuild in progress (v73)

All sources route through the Cloudflare Worker or are called directly from the browser (CFTC).
Worker code: `docs/worker-nv-macro.js`. Standalone test page: `macro-test.html`.

**Worker routes:**
- `/quotes` → FX rates (Frankfurter — EURUSD, GBPUSD, USDJPY, USDCHF, AUDUSD), Gold (gold-api.com real-time + fawazahmed0 prev close), VIX (Yahoo Finance `^VIX` 5d), DXY (computed from FX basket)
- `/fred` → US 10Y (`DGS10`), US 2Y (`DGS2`), Yield Curve (`T10Y2Y`), HY Spread (`BAMLH0A0HYM2`) — requires `FRED_KEY` env var
- `/ecb-bund` → DE 10Y Bund (ECB SDW API)
- `/uk-gilt` → UK 10Y Gilt (Yahoo Finance multi-ticker fallback — currently returning null, unresolved)
- `/finnhub` → SPY, QQQ, TLT, HYG, UUP (Finnhub free tier) — requires `FINNHUB_KEY` env var
- `/ff-calendar` → FF Calendar (`nfs.faireconomy.media/ff_calendar_thisweek.json`)

**Direct browser calls (no Worker):**
- **Retail positioning:** CFTC `publicreporting.cftc.gov` — non-reportable long/short % for EUR + GBP. Section label: "Retail Positioning — CFTC".
- **COT:** CFTC API — EUR/GBP asset manager + leveraged money net positioning, WoW change

**Worker env vars** (Cloudflare → Settings → Variables → Secrets):
- `FRED_KEY` = `040085d7ef6668a63a371dfa37dc107d`
- `FINNHUB_KEY` = set (masked)

**DXY formula:** `50.14348112 × EURUSD^(-0.576) × USDJPY^(0.136) × GBPUSD^(-0.119) × USDCAD^(0.091) × USDSEK^(0.042) × USDCHF^(0.036)`

---

## 12. Commercial Productization Sprint (future)

> Separate repo from nvbuild. Full task list: **`docs/ROADMAP.md`** (Commercialisation section).

Key decisions made: £49 one-time, Gumroad, light obfuscation only, buyer self-hosts on GitHub Pages + Supabase.

---

## 13. Known Architectural Gotchas

- **`c.scale()` in canvas rendering double-scales `lineWidth`.** Map SVG coordinates directly to pixels via `s = size/200` with no transform. Applies to NVTemplate canvas export.
- **NVTemplate export** must render to a fresh offscreen canvas via a shared `drawAll()` function — reading back from the screen canvas captures only the last image.
- **GitHub Pages deploy lag** is ~2 minutes. Do not test immediately after push.
- **`web_fetch` on GitHub Pages URLs is unreliable** for source analysis. Always upload the file directly.
- **Non-deterministic Supabase row IDs** cause duplicate rows on re-render. Use deterministic keys (e.g. `wr_` + weekKey) for any component that upserts on mount or state change.
- **`PositionCalcInner`** must be defined outside `NVJournal` render body, otherwise the calculator input loses focus on every keystroke.
