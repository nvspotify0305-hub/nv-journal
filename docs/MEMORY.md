# NV Journal — Project Memory
> Permanent, append-only project memory. Never delete entries.
> Each entry prefixed with date. Add new entries at the bottom of each section.

---

## Architectural Decisions

| Date | Decision | Why |
|------|----------|-----|
| 2026-03-22 | Single pre-compiled HTML file (no build step, no JSX source) | Simplicity — React 18 UMD via CDN, Babel in-browser, no bundler. Keeps deploy to a simple file copy |
| 2026-03-22 | Supabase free tier with anon key (no auth) | Personal-use app — no user accounts needed. API key hardcoded in source |
| 2026-03-22 | Offline-first with localStorage cache + sync queue | Reliability — app works without internet, syncs when connection restores |
| 2026-03-22 | Grade scores stored on save, never recalculated | Prevents retroactive grade changes when model evolves (v1 → v2). Historical integrity preserved |
| 2026-03-22 | All UI primitives defined OUTSIDE React component body | Prevents remount/scroll-jump bugs in single-component architecture |
| 2026-03-22 | NVJournal_source.html is the only working file; index.html is deploy target only | Prevents accidental edits to the live file. Deploy = copy + push |
| 2026-03-22 | NV Template kept as separate standalone app, never merged into NV Journal | Different purpose (chart composition/social export) — shared theme via localStorage only |
| 2026-03-22 | Grade model version tracked separately from app version | Allows app to evolve (v60→v65) without invalidating stored grades |
| 2026-03-24 | Prop firm accounts store daily_pnl as array inside jsonb `data` column | Single-table design — avoids extra Supabase tables, keeps free tier headroom |
| 2026-03-24 | parseRValue() helper defined outside component body | Consistent with UI primitives rule — prevents re-creation on every render |

---

## Abandoned Approaches

| Date | What | Why Abandoned |
|------|------|---------------|
| 2026-03-22 | Macro tab (economic calendar, market data) | Permanently removed — unreliable free-tier stack (Alpha Vantage API + Cloudflare Worker KV). Do not re-add |
| 2026-03-22 | Glassmorphic header (backdrop-filter blur) | Replaced with opaque header in v63 — blur caused content bleed-through on scroll |
| 2026-03-22 | GradePanel full-width layout | User declined — not needed (2026-03-22) |
| 2026-03-22 | Footer model version label | User declined — not needed (2026-03-22) |

---

## Hard Rules Discovered

| Date | Rule | Context |
|------|------|---------|
| 2026-03-22 | C5+ on any timeframe = hard block, always grade B, no exceptions | Core grading rule — prevents overriding with high confluence scores |
| 2026-03-22 | Never rewrite whole file — surgical edits only | Single 10,000+ line HTML file — full rewrites risk data loss and introduce merge conflicts |
| 2026-03-22 | NT trades: hypo_outcome must be W/L/BE, never "NT" | NT means "not taken" — the hypothetical outcome tracks what would have happened |
| 2026-03-22 | SESSION_NOTES.md keeps only most recent session — delete previous on every update | Prevents unbounded growth; current state only, not a history log |
| 2026-03-22 | Never change version string without explicit user instruction | Version bumps are intentional deploy markers, not automatic |
| 2026-03-22 | Supabase sync overwrites localStorage on mount | Data injected via localStorage alone will be overwritten — must use sbSave() to persist |
| 2026-03-24 | Deploy Lock — no deploy/push unless user explicitly says "deploy", "push", "go live", or runs /deploy | Prevents accidental deploys during development sessions |
| 2026-03-22 | localStorage cache key versions (v5, v2, v1) must be bumped on schema changes | Old cache won't auto-migrate — version bump forces fresh load from Supabase |

---

## Key Lessons Learned

| Date | Lesson | Context |
|------|--------|---------|
| 2026-03-22 | Clock component must be isolated from App root state | Clock in App root caused 30-second re-render pulsation across entire UI (fixed v63) |
| 2026-03-22 | Free-tier external APIs are unreliable for production features | Macro tab failure — Alpha Vantage rate limits + Cloudflare Worker KV instability made it unusable |
| 2026-03-24 | FundedNext preset values must match official rules exactly | Initial preset had wrong values — corrected to 8% target, 4% daily loss, 8% max DD for 10k account |
| 2026-03-24 | TopstepX share links don't include R-value data | R values couldn't be imported — only $ P&L and trade counts available from share link format |
| 2026-03-22 | Opaque backgrounds > glassmorphic blur for data-dense UIs | Blur effects cause readability issues when scrolling content behind header in compact layouts |
