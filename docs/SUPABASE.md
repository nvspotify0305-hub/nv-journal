# NV Journal — Supabase Reference
> Read this before touching any data layer, storage, or sync logic in NVJournal_source.html

---

## Connection

| Key | Value |
|-----|-------|
| URL | `https://sskklvnfmclmfuqpkcpt.supabase.co` |
| Role | `anon` (public key, no auth) |
| Auth method | API key via headers (`apikey` + `Authorization: Bearer`) |
| Tier | **Free** — respect row/storage limits |

> ⚠️ SB_KEY is hardcoded in source. Do not rotate without updating the source file.

---

## Tables

### `trades`
Primary trade log. One row per trade entry.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string/uuid | Primary key |
| `data` | JSON | Full trade object (see schema below) |

**Trade object schema (stored in `data`):**

| Field | Default | Notes |
|-------|---------|-------|
| `date` | today() | YYYY-MM-DD |
| `pair` | "EURUSD" | EURUSD or GBPUSD |
| `session` | autoSession(tz) | AM / Midday / PM |
| `direction` | "Long" | Long / Short |
| `daily_bias` | "Bullish" | Bullish / Bearish / Neutral |
| `h4_bias` | "Bullish" | Bullish / Bearish / Neutral |
| `h1_bias` | "Bullish" | Bullish / Bearish / Neutral |
| `daily_candle` | "C2" | C2 / C3 / C4 / C5+ |
| `h4_candle` | "C2" | C2 / C3 / C4 / C5+ |
| `h1_candle` | "C2" | C2 / C3 / C4 / C5+ |
| `key_zone` | "H1 FVG" | See key zone options below |
| `h1_phase` | "Consolidation" | Expansion / Continuation / Consolidation |
| `smt_h4_pair` | "" | SMT pair for H4 |
| `smt_h1_pair` | "" | SMT pair for H1 |
| `trade_taken` | false | bool — NT if false |
| `r_result` | "" | R value if taken |
| `outcome` | "NT" | W / L / BE / NT |
| `hypo_result` | "" | R value for NT trades |
| `hypo_outcome` | "W" | W / L / BE — NT trades only |
| `hesitation` | false | bool |
| `no_trade_reason` | "" | See NO_TRADE_R options |
| `chart_image` | "" | Supabase storage URL |
| `notes` | "" | Free text |
| `grade` | stored on save | A+ / A / B / C |
| `grade_score` | stored on save | 0–35 pts |
| Confluence flags | bool | sweep_h4, sweep_h1, smt_h4, smt_h1, cisd_h1, cisd_h4, ltf_5m_cisd, displacement, discount_prem, psp |

---

### `days`
Daily journal entries + weekly reviews. Mixed `_type` field.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string/uuid | Primary key |
| `data` | JSON | Day or week object |

**Day object schema:**

| Field | Default | Notes |
|-------|---------|-------|
| `date` | today() | YYYY-MM-DD |
| `bias` | "Bullish" | Overall daily bias |
| `bias_am` | "" | AM session bias |
| `bias_pm` | "" | PM session bias |
| `flip_time` | "" | Time bias flipped |
| `notes` | "" | Daily notes |
| `notes_am` | "" | AM notes |
| `outcome` | "" | Day outcome |
| `confirmed` | false | bool |
| `_type` | — | "week_review" if weekly note |

**Week review records** (stored in `days` table):
- Identified by `_type === "week_review"`
- Created by AI weekly notes generator in Review tab
- localStorage cache key: `nv_weekly_v1`

---

### `crypto`
Crypto holdings tracker.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string/uuid | Primary key |
| `data` | JSON | Holding object |

- localStorage cache key: `nv_crypto_v2`

---

### `prop_firms`
Prop firm evaluation accounts.

| Field | Type | Notes |
|-------|------|-------|
| `id` | text | Primary key |
| `data` | jsonb | Full account object |

**Account object schema (stored in `data`):**

| Field | Notes |
|-------|-------|
| `id` | Same as row id |
| `name` | User label e.g. "Topstep 50k #1" |
| `firm` | Preset key: Topstep 50k / FundedNext 10k / FTMO 10k / Apex 50k / Custom |
| `initial_balance` | Starting account size in $ |
| `phase` | Evaluation / Phase 2 / Funded / Blown / Passed |
| `status` | active / passed / blown / archived |
| `profit_target_pct` | Target as % of initial balance |
| `daily_loss_pct` | Daily loss limit as % (0 = no limit) |
| `max_dd_pct` | Max drawdown as % |
| `dd_type` | trailing_eod / static / trailing_equity / scaling |
| `min_trading_days` | Minimum days required (0 = none) |
| `consistency_rule` | bool — best day ≤ 50% of target |
| `start_date` | YYYY-MM-DD |
| `daily_pnl` | Array of `{ id, date, pnl, r_value, note }` |

- localStorage cache key: `nv_propfirms_v1`

**Create SQL:**
```sql
CREATE TABLE prop_firms (
  id text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb
);
ALTER TABLE prop_firms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON prop_firms FOR ALL USING (true) WITH CHECK (true);
```

---

## Storage Bucket

| Key | Value |
|-----|-------|
| Bucket name | `trade-charts` |
| Access | **Public** (must be set public in Supabase dashboard) |
| Upload method | `PUT /storage/v1/object/trade-charts/{path}` with `x-upsert: true` |
| Public URL | `{SB_URL}/storage/v1/object/public/trade-charts/{path}` |
| Delete method | `DELETE /storage/v1/object/trade-charts/{path}` |

> ⚠️ If bucket is not set to public, chart image uploads will fail silently. Error shown: "Upload failed — check Supabase bucket 'trade-charts' is public"

---

## Core Data Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `sbLoad(tbl)` | ~line 62 | Load all records from table — returns array of `data` objects |
| `sbSave(tbl, rec)` | ~line 118 | Upsert record — falls back to offline queue on failure |
| `sbDel(tbl, id)` | ~line 155 | Delete record by id |
| `sbUploadImage(file)` | ~line 185 | Upload chart image to trade-charts bucket |
| `sbDeleteImage(url)` | ~line 233 | Delete chart image by URL |

---

## Offline Sync Queue

| Key | Value |
|-----|-------|
| localStorage key | `nv_sync_queue` |
| Trigger | `sbSave` fails (network offline) |
| Retry | On next app load / connection restore |
| Status indicator | Colored dot in header (green=synced, amber=pending, red=failed) |

> ⚠️ Never bypass the sync queue. All writes must go through `sbSave`.

---

## localStorage Cache Keys

| Key | Table | Notes |
|-----|-------|-------|
| `nv_trades_v5` | trades | Primary trade cache |
| `nv_days_v2` | days | Day journal cache |
| `nv_weekly_v1` | days (_type=week_review) | Weekly notes cache |
| `nv_crypto_v2` | crypto | Crypto holdings cache |
| `nv_propfirms_v1` | prop_firms | Prop firm accounts cache |
| `nv_sync_queue` | — | Offline write queue |
| `nv_tz` | — | Timezone preference |
| `nv_calc_mode` | — | Calculator mode (futures/forex) |
| `nv_calc_acct` | — | Account size |
| `nv_calc_risk` | — | Risk % |
| `nv_calc_pips` | — | Pip value |
| `nv_calc_ticks` | — | Tick value |

> ⚠️ Cache key version suffixes (v5, v2, v1) must be bumped if schema changes — old cache will not auto-migrate.

---

## Free Tier Constraints

| Limit | Value | Impact |
|-------|-------|--------|
| Database rows | 50,000 | ~years of daily trades — no concern |
| Storage | 1 GB | Chart images — monitor if uploading large PNGs |
| Bandwidth | 2 GB/month | Low traffic app — no concern |
| API requests | Unlimited on free | No concern |

---

## Key Zone Options (reference)

`H1 FVG`, `H4 FVG`, `Daily FVG`, `H1 OB`, `H4 OB`, `Daily OB`, `Previous High`, `Previous Low`, `None`

---

## No Trade Reason Options (reference)

`Lack of RR`, `Poor Entry Timing`, `News`, `Choppy PA`, `Opposing Key Level`, `No Setup`, `Missed`, `Non-Executable C5+`, `Other`
