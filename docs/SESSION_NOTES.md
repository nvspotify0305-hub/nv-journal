## Macro data sources fully live — 2026-04-04

### Done
- Diagnosed Rates and Pair Drivers section showing all dashes — root cause: FRED API key (`37f26749...`) had pending email confirmation, never activated
- Fixed calendar silent bug: FF Calendar API returns `currency` field but code was filtering on `ev.country` — every event silently dropped. Fixed to `ev.currency` in both filter and map
- Updated Rates section notes to surface Bund value when FRED is down, explicit "no Gilt source" for UK row, "FRED key unconfirmed" for HY/Yield Curve rows
- Created new FRED API key `040085d7ef6668a63a371dfa37dc107d`, updated Cloudflare env var `FRED_KEY` — all four FRED series now returning live data (US 10Y 4.31%, US 2Y 3.79%, T10Y2Y +0.51%, HY Spread 3.17%)
- Fixed UK 10Y Gilt source: replaced dead Yahoo Finance tickers with Bank of England IADB CSV API (`IUDMNPY` series) — returning 4.862%. FRED monthly `IRLTLT01GBM156N` added as fallback
- All six rate sources now live: US 10Y, US 2Y, Yield Curve, HY Spread (FRED), DE Bund (ECB), UK Gilt (BoE)

### Confirmed working sources
- `/fred` — FRED API, all four series returning live daily data
- `/ecb-bund` — ECB SDW, DE 10Y Bund 3.048%
- `/uk-gilt` — BoE IADB CSV, UK 10Y Gilt 4.862% (FRED monthly fallback available)
- `/ff-calendar` — FF Calendar, now correctly filtering by `currency` field
- `/quotes`, `/finnhub`, CFTC retail, CFTC COT — all confirmed working from previous session

### Next Session
- Review full Macro tab visually with all data now live
- Consider MacroTab layout rebuild (macro-dashboard.html blueprint) if user wants to proceed

---

## MacroTab rebuild prep — 2026-04-01

### Done
- Built Cloudflare Worker v2 (`docs/worker-nv-macro.js`) with new routes:
  - `/quotes` — FX via Frankfurter, Gold via gold-api + fawazahmed0, VIX via Yahoo Finance `^VIX`, DXY computed
  - `/fred` — US 10Y, US 2Y, T10Y2Y, HY spread via FRED API (`env.FRED_KEY`)
  - `/ecb-bund` — DE 10Y Bund via ECB SDW API
  - `/uk-gilt` — UK 10Y Gilt via Yahoo Finance (multiple ticker fallbacks — still returning null)
  - `/finnhub` — SPY, QQQ, TLT, HYG, UUP via Finnhub (`env.FINNHUB_KEY`)
  - `/ff-calendar` — FF Calendar (unchanged)
- Built `macro-test.html` standalone data source test page — verifies all sources before MacroTab rebuild
- Confirmed working: FX, DXY, VIX, ECB Bund, Finnhub ETFs, CFTC retail, CFTC COT, FF Calendar
- Worker deployed to `nv-macro.nv-trading23.workers.dev`
- Env vars set in Cloudflare: `FRED_KEY`, `FINNHUB_KEY`

### Known Issues
- FRED yields returning no data — key `37f26749b094875c0ee8b0a710626986` set in Worker but email confirmation from St. Louis Fed still pending
- UK 10Y Gilt still null — Yahoo Finance tickers `GB10YT=RR`, `GB10Y=R`, `^TNT` all returning no data. Need alternative source.
- Finnhub free tier: forex pairs not available (paid only). ETFs work fine.

### Next Session
- Wait for FRED email confirmation — check inbox, then verify yields load in macro-test.html
- Find working source for UK 10Y Gilt (alternative to Yahoo Finance)
- Design MacroTab UI to match NVJournal dark theme (Bebas Neue, C.xx tokens, Card components)
- Replace MacroTab in `NVJournal_source.html` → build → v73

---

## MacroTab local rebuild handoff — 2026-04-02

### Scope / guardrails
- This repo is a test copy only. Do not push, deploy, or touch live without explicit user permission.
- Working files changed locally: `NVJournal_source.html`, `index.html`

### What was done locally
- Read session docs and reviewed current Macro architecture vs. test implementations
- Updated Macro data plumbing in `NVJournal_source.html` to use Worker v2 style sources:
  - `/quotes`
  - `/fred`
  - `/ecb-bund`
  - `/uk-gilt`
  - `/finnhub`
  - existing CFTC retail + COT routes kept
- Removed dead MyFxBook dependency from Macro tab path
- Bumped Macro cache key from `nv_macro_v1` to `nv_macro_v2`
- Adjusted calendar processing to derive local event date/hour using `tzOff` instead of relying on raw UTC day buckets
- Rebuilt local `index.html` with `node build.js`
- Script validation passed with embedded script compile check (`script-ok`)

### Review conclusions
- Real blocker is architectural drift: old in-app MacroTab logic vs. cleaner test-page/Worker v2 contract
- Current live-style calendar source is still the weakest part of Macro
- Risk/sentiment logic should be rebuilt around the newer data stack, not the old 4-signal proxy model
- The tab needs a layout rebuild, not more patchwork inside the old composition

### Design feedback from user
- First redesign pass was rejected because it still looked too close to the old Macro
- Second custom dashboard/hero direction was rejected
- User explicitly prefers the layout direction from `macro-test.html`
- User then pointed to `macro-dashboard.html` as the strongest layout reference
- Required constraint: keep NVJournal app theme/design language; do not import a foreign visual system

### Recommended layout direction
- Use `macro-dashboard.html` as the layout blueprint only
- Keep NVJournal styling/tokens/fonts/card language
- Structure:
  - top verdict bar
  - compact session/status row
  - main grid with prices / DXY / risk / calendar / yields
  - bottom strip for retail / COT / curve / credit quick reads

### API / source decisions for next pass
- Economic calendar: replace FF dependency with TradingEconomics calendar API
  - reason: more complete US/EU/GB coverage, includes actual / previous / forecast / importance
- FX quotes: use Twelve Data for fresher pricing if live-enough quotes are required
- Keep FRED for US rates/curve/credit
- Keep ECB for Bund
- Keep Finnhub for ETF/cross-asset proxies
- Keep CFTC for retail positioning and COT

### Important unresolved issue
- Macro layout still needs to be rebuilt properly in `NVJournal_source.html` to match the `macro-dashboard.html` structure
- User wants the chart smaller in the next session

### Next Session
- Re-open `macro-dashboard.html` and port its layout structure into `NVJournal_source.html`
- Keep NVJournal theme intact
- Make the relevant chart smaller as requested by user
- If proceeding with source upgrades, replace FF calendar plan with TradingEconomics and evaluate Twelve Data for fresher FX quotes
