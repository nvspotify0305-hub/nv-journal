## v70 — 2026-03-29

### Done
- COT live data: CFTC public reporting API (`traders-in-financial-futures-combined` dataset)
  - EUR Futures and GBP Futures non-commercial net positioning (long - short)
  - WoW change vs prior week, bullish/bearish flag, report date shown
  - 24hr cache in `nv_macro_v1` localStorage
- MyFxBook CORS confirmed working from browser — STATUS:200, no proxy needed
- Global Claude Code skills installed: feature-dev, code-review, pr-review-toolkit, hookify, example-skills, document-skills, claude-api, github plugin
- GitHub PAT configured in `~/.claude/settings.json` env for GitHub MCP plugin

### Architecture Note
CFTC API field `report_date_as_yyyy_mm_dd` returns full ISO timestamp — slice to 10 chars for display.

### Next Session
- Test MyFxBook retail sentiment on live site with updated credentials
- Test COT data on live site (should show EUR/GBP net positioning from latest weekly report)
- Begin sales version repo structure (Phase 10): separate repo, strip personal data, light obfuscation

---

## v69 — 2026-03-28

### Done
- Responsive layout (v68): 768px+ breakpoints, mobile grid collapse, scrollable nav, footer cleanup
- Interactive dot-grid background: 24px spacing, mouse parallax, two-pass canvas render (perf optimised)
- Dot-grid on lock screen: DotGrid accepts canvasStyle + isDark props, renders inside LockScreen container
- Review tab reset bug fixed: useEffect deps changed from weeklyData object to extracted primitive string/number values
- Days tab: WeeklyTrend SVG chart (8-week bias accuracy), analytics in horizontal equal-height row (BiasEngine + DowChart + WeeklyTrend)
- Macro tab rebuilt as live MacroTab component:
  - Prices: frankfurter.app (EURUSD, GBPUSD, USDJPY, USDCHF, AUDUSD + Gold via gold-api.com)
  - Risk sentiment: auto-derived from Gold + JPY + CHF + AUD daily direction — no manual toggle
  - Calendar: Forex Factory high-impact (USD/EUR/GBP only), timezone-converted to user TZ, session-grouped
  - Calendar shows actual announced data vs forecast/previous after event fires (green if beat, red if miss)
  - Retail sentiment: MyFxBook community outlook via email/password auth + session token caching
  - COT: hardcoded mockup (EUR +45,231 / GBP -12,456) — CFTC live data pending
  - DXY bias: manual 3-button toggle (Bullish/Neutral/Bearish), persisted in nv_dxy_bias localStorage
- MyFxBook credentials (email + password) added to Settings bar — Save button, session cached in nv_mfxbook_session
- Macro tab cache: nv_macro_v1 in localStorage — prices 30min TTL, calendar 4hr, sentiment 1hr
- Log Trade tab accidentally deleted during Macro mockup replacement (end marker matched too broadly) — restored from v68 archive and redeployed
- Deploy rule saved to memory: never build/push mid-session without explicit instruction

### Known Issues
- MyFxBook CORS not yet confirmed — will know on first live test. If blocked, route through Cloudflare Worker.
- MyFxBook API only supports email/password login — Google OAuth users cannot use it without a separate password account
- COT section is hardcoded mockup — CFTC live integration pending
- Forex Factory calendar unavailable in local preview (CORS blocked) — works on live domain only

### Architecture Note
When replacing large inline tab blocks, verify the end marker is unique to that block only — adjacent tab renders can be accidentally included. Use git archive to recover if needed.

### Next Session
- Test MyFxBook retail sentiment on live site — if CORS blocked, add proxy endpoint to Cloudflare Worker
- COT live data: CFTC API integration (weekly cadence, cached in localStorage)
- Verify calendar actuals display correctly on a live high-impact news day
- Begin sales version repo structure planning (separate repo, strip personal data, obfuscate)
