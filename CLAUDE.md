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
| Macro data | Cloudflare Worker (`nv-macro`) — proxies Alpha Vantage, caches in KV |
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

All tables use the same minimal schema — app logic lives in the `data` JSONB blob:

```sql
-- All three tables share this pattern
CREATE TABLE trades (
  id   bigint PRIMARY KEY,  -- deterministic: timestamp-based or wr_ prefixed
  data jsonb NOT NULL
);

CREATE TABLE days (
  id   bigint PRIMARY KEY,
  data jsonb NOT NULL
);

CREATE TABLE crypto (
  id   bigint PRIMARY KEY,
  data jsonb NOT NULL
);
```

### `trades` — `data` JSONB shape
```json
{
  "id": "string (UUID or deterministic key)",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "session": "7AM | 11AM | 3PM",
  "pair": "EURUSD | GBPUSD",
  "direction": "Long | Short",
  "candleSeq": "C1 | C2 | C3 | C4 | C5+",
  "result": "Win | Loss | BE",
  "rr": number,
  "pnl": number,
  "grade": "A+ | A | B",
  "gradeScore": number,
  "notes": "string",
  "imageUrl": "string (Supabase Storage URL, optional)",
  "confluences": {
    "sweepH4": boolean,
    "sweepH1": boolean,
    "smtH4": boolean,
    "smtH1": boolean,
    "cisdH1": boolean,
    "cisdH4": boolean,
    "psp": boolean,
    "keyZone": boolean,
    "displacement": boolean,
    "discountPremium": boolean,
    "htfDaily": boolean,
    "htfH4": boolean,
    "htfH1": boolean,
    "h1Phase": "Expansion | Continuation | Manipulation | Consolidation"
  }
}
```

### `days` — `data` JSONB shape
```json
{
  "date": "YYYY-MM-DD",
  "bias": "Bullish | Bearish | Neutral",
  "notes": "string",
  "mindsetRating": 1-5,
  "mindsetNotes": "string",
  "weekKey": "string (YYYY-Www)",
  "weeklyMindsetRating": 1-5,
  "weeklyMindsetNotes": "string"
}
```

> Weekly mindset rows use deterministic IDs: `wr_` + weekKey (e.g. `wr_2026-W11`). This prevents duplicate rows on re-render.

### `crypto` — `data` JSONB shape
```json
{
  "date": "YYYY-MM-DD",
  "asset": "string",
  "entry": number,
  "amount": number,
  "notes": "string"
}
```

### Storage
- **Bucket:** `trade-charts` (public, anon read/write policy)
- Used for trade screenshot uploads (Ctrl+V in Log Trade → upload → URL saved in trade JSON)

---

## 5. localStorage Keys

| Key | Purpose |
|---|---|
| `nv_trades_v5` | Local trade cache |
| `nv_days_v2` | Local days cache |
| `nv_crypto_v2` | Local crypto cache |
| `nv_theme` | `dark` \| `light` |
| `nv_calc_acct` | Calculator: account size |
| `nv_calc_risk` | Calculator: risk % |
| `nv_calc_pips` | Calculator: pip SL |
| `nv_calc_ticks` | Calculator: tick SL |
| `nv_calc_mode` | Calculator: FX \| Futures |
| `nv_tz` | Timezone override |
| `nv_dst` | DST toggle state |
| `nv_av_key` | Alpha Vantage key (legacy, replaced by Worker) |
| `nv_macro_cache` | Macro tab data cache (4hr TTL) |

---

## 6. Cloudflare Worker — `nv-macro`

**Worker URL:** `https://nv-macro.nv-trading23.workers.dev`

- Proxies Alpha Vantage (AV key hardcoded in Worker, not in browser)
- KV namespace: `NV_MACRO` bound as `MACRO_CACHE`
- Cron: every 15 minutes
- Computes FX crosses: EURGBP, GBPJPY, EURJPY, CADJPY, EURCAD, GBPCHF, NZDUSD
- App calls Worker directly — never calls Alpha Vantage from browser
- App-side cache: `nv_macro_cache` localStorage, 4hr TTL

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

### Dark Mode
| Token | Value |
|---|---|
| `bg` | `#141414` |
| `surface` | `#1c1c1c` |
| `surfaceHigh` | `#242424` |
| `border` | `#333` |
| `text` | `#f0f0f0` |
| `textMid` | `#888` |
| `textDim` | `#555` |
| `accent` | `#fff` |
| `green` | `#3dd68c` |
| `red` | `#f06464` |
| `blue` | `#60a5fa` |
| `yellow` | `#fbbf24` |

### Light Mode
| Token | Value |
|---|---|
| `bg` | `#f0f0f0` |
| `surface` | `#fff` |
| `surfaceHigh` | `#f5f5f5` |
| `border` | `#ddd` |
| `text` | `#000` |
| `textMid` | `#444` |
| `textDim` | `#999` |
| `accent` | `#000` |
| `green` | `#1a6e35` |
| `red` | `#c0392b` |
| `blue` | `#1a4fa0` |
| `yellow` | `#8a6500` |

---

## 9. NV Logo Spec

SVG `viewBox="0 0 200 200"`:
- Circle: `cx=100 cy=100 r=88`, no fill, stroke width 5.5
- Vertical line: `x1=100 y1=42 x2=100 y2=148`, stroke-linecap round, width 4.5
- Dot: circle `cx=100 cy=159 r=5`, filled
- **N letter:** two rects `x=30,y=58,w=10,h=72` and `x=80,y=58,w=10,h=72`; diagonal polygon `30,58 40,58 90,130 80,130`
- **V letter:** left polygon `110,58 121,58 143,124 132,124`; right polygon `158,58 169,58 147,124 136,124`

---

## 10. Active Sprint — Execution Roadmap

| Phase | Status | Description |
|---|---|---|
| Phase 1 | ✅ Done | Cloudflare Worker + KV cache + cron trigger |
| **Phase 2** | 🔜 **Next** | Grade Model v2 (score 0–20, new fields, H1 Phase selector) |
| Phase 3 | Pending | Persistent status bar |
| Phase 4 | Pending | Pre-session morning brief |
| Phase 5 | Pending | Funded account tracker (Topstep / FundedNext) |
| Phase 6 | Pending | UI polish pass |
| Phase 7 | Pending | Gallery + trade image viewer |

### Phase 2 — Grade Model v2 Scope (detailed)

**New input fields to add to Log Trade form:**
- `h1Phase` selector: Expansion / Continuation / Manipulation / Consolidation
- `smtH4` checkbox (currently SMT is a single field — split into H4 and H1)
- `smtH1` checkbox
- `cisdH4` checkbox (currently only CISD H1 exists)
- `discountPremium` checkbox
- `displacement` checkbox (may already exist — verify)

**Fields to remove:**
- `guConfirm` (GU Confirm — removed in v2)
- `htfKeyLevel` (merged into `keyZone`)

**Grading function changes:**
- Rewrite `calculateGrade()` to implement 0–20 scoring per spec in §3
- Hard blocks: C5+, H1 conflict, no sweep AND no SMT
- A+/A/B thresholds per §3
- B is now **tradeable** — remove any UI treatment that marks B as "not tradeable" except for execution filter

**Dashboard/stats impact:**
- Grade score should be stored in trade JSON for analytics
- Market Phase stats panel (already built, filtered to March 2026+) needs `h1Phase` data

**Backward compatibility:**
- Trades stored under v1 grading must **not** be retroactively recalculated
- `gradeDisplay` reads stored `grade` field — do not trigger recalculation from stored confluences

---

## 11. Pending — Macro Tab Features

Priority order:

1. **Interest rate panel** — Fed/ECB/BoE rates, differential, next meeting date. Use FRED API (free, no key required for public series).
2. **COT positioning** — CFTC CSV data via Worker. EUR and GBP net non-commercial positions.
3. **Live commodities/indices** — Oil, DXY, S&P 500, VIX via Yahoo Finance proxied through Worker.
4. **Pair bias conflict flag** — cross-reference macro bias vs logged daily bias from `days` table.
5. **News danger zone** — surface high-impact news events on the Log Trade form.

---

## 12. Commercial Productization Sprint (future)

Tasks required to strip personal data and prepare for distribution:

| Task | Notes |
|---|---|
| Remove hardcoded Supabase URL + anon key | Replace with env config UI on first launch |
| Remove hardcoded Worker URL | Make configurable |
| Remove Alpha Vantage key reference | Worker handles this — confirm no browser-side AV calls remain |
| Anonymise any personal defaults | Account sizes, risk defaults, timezone defaults |
| Add onboarding flow | First-launch config screen: Supabase URL, anon key, Worker URL, default risk |
| Rename `nv_*` localStorage keys | Namespace to user-configurable prefix or generic `journal_*` |
| Replace NV branding | Config-driven: user sets their own initials/logo or remove entirely |
| License + README | MIT or proprietary — decide before release |
| Remove `crypto` tab or make optional | Personal use case — not universally relevant |

> Do not start productization work until Phase 6 (UI polish) is complete. Premature abstraction on an unstable UI wastes time.

---

## 13. Known Architectural Gotchas

- **`c.scale()` in canvas rendering double-scales `lineWidth`.** Map SVG coordinates directly to pixels via `s = size/200` with no transform. Applies to NVTemplate canvas export.
- **NVTemplate export** must render to a fresh offscreen canvas via a shared `drawAll()` function — reading back from the screen canvas captures only the last image.
- **GitHub Pages deploy lag** is ~2 minutes. Do not test immediately after push.
- **`web_fetch` on GitHub Pages URLs is unreliable** for source analysis. Always upload the file directly.
- **Non-deterministic Supabase row IDs** cause duplicate rows on re-render. Use deterministic keys (e.g. `wr_` + weekKey) for any component that upserts on mount or state change.
- **`PositionCalcInner`** must be defined outside `NVJournal` render body, otherwise the calculator input loses focus on every keystroke.
