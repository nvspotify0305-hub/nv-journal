# NV-System — Trading Rules Reference
> Read this before making any UI, logic, or data decisions that touch sessions, pairs, grading, or trade fields.
> These rules reflect the live trading methodology. Never change enums, options, or logic without explicit instruction.

---

## Markets

| Field | Values |
|-------|--------|
| Pairs | `EURUSD`, `GBPUSD` |
| SMT Pairs | `EURUSD`, `GBPUSD`, `DXY` |

---

## Sessions (Dublin/London Time)

| Session | Time (Standard) | Time (DST) | Code Label |
|---------|----------------|------------|------------|
| AM | 07:00 | 06:00 | `7AM` |
| Midday | 11:00 | 10:00 | `11AM` |
| PM | 15:00 | 14:00 | `3PM` |

**Auto-session logic:** Based on current Dublin hour. Cutoffs shift by 1hr during DST.
**DST toggle:** Stored in `localStorage` key `nv_dst` (bool). User-controlled in app.
**Timezone options:** London/Dublin (hasDST: true), New York, Sydney.

> ⚠️ Never hardcode session times. Always use `autoSession(tz, dst)` or reference `TZ_MAP` / `TZ_DST_MAP`.

---

## Trade Direction & Bias

| Field | Options |
|-------|---------|
| Direction | `Long`, `Short` |
| Bias (Daily/H4/H1) | `Bullish`, `Bearish`, `Neutral` |
| Bias Outcome | `Correct`, `Wrong`, `Trash Day` |

---

## Candle Position

| Value | Meaning | Grade Impact |
|-------|---------|-------------|
| `C2` | Second candle — optimal entry | No restriction |
| `C3` | Third candle | No restriction |
| `C4` | Fourth candle | No restriction |
| `C5+` | Fifth candle or later | **Hard block — always grade B** |

Applied to: `daily_candle`, `h4_candle`, `h1_candle`

---

## H1 Market Phase

| Phase | Grade Bonus | Color |
|-------|------------|-------|
| `Expansion` | +2 pts | Green |
| `Continuation` | +1 pt | Blue |
| `Manipulation` | 0 pts | Yellow |
| `Consolidation` | 0 pts | Muted |

Full list: `["Consolidation", "Manipulation", "Continuation", "Expansion"]`

---

## Key Zones

```
"Daily FVG", "H4 FVG", "H1 FVG", "IFVG", "PDH", "PDL",
"Swing High", "Swing Low", "HTF Key Level", "OB Daily", "OB H4", "None"
```

- Key Zone **required** for A/A+ grade
- `"None"` = no key zone = cannot grade A or A+
- Tracked via select dropdown, not checkbox

---

## Confluence Factors (CONF_ALL)

| Key | Label | Points | Type |
|-----|-------|--------|------|
| `sweep_h4` | Sweep H4 | 4 | Major signal |
| `sweep_h1` | Sweep H1 | 4 | Major signal |
| `smt_h4` | SMT H4 | 4 | Major signal |
| `smt_h1` | SMT H1 | 4 | Major signal |
| `cisd_h1` | CISD H1 | 3 | Required for A/A+ |
| `cisd_h4` | CISD H4 | 1 | Bonus |
| `ltf_5m_cisd` | 5M CISD | 2 | Required for A+ |
| `displacement` | Displacement | 1 | Bonus |
| `discount_prem` | Premium/Discount | 2 | Bonus |
| `psp` | PSP | 1 | Bonus |

All confluence fields are **boolean** (checkbox). Stored on trade record.

---

## Trade Outcomes

| Value | Meaning |
|-------|---------|
| `Win` | Taken trade — profitable |
| `Loss` | Taken trade — loss |
| `BE` | Taken trade — breakeven |
| `NT` | Not taken |

---

## NT (Not Taken) Trade Rules

- `trade_taken` = false
- `hypo_outcome` = `W` / `L` / `BE` only (never `NT`)
- `hypo_result` = hypothetical R value (auto-filled)
- `r_result` = blank
- Display: muted bracketed hypo result on TradeRow
- Grade still calculated and stored

---

## No Trade Reasons

```
"Lack of RR", "Poor Entry Timing", "News", "Choppy PA",
"Opposing Key Level", "No Setup", "Missed", "Non-Executable C5+", "Other"
```

---

## Execution Rules (UI must reflect these)

| Rule | Detail |
|------|--------|
| Execute only A+ and A | B and C are logged but never traded |
| A+ status label | ✓ EXECUTE (green) |
| A status label | ✓ EXECUTE (green) |
| B status label | ⚠ LOW QUALITY (yellow) |
| Hard block label | ✗ HARD BLOCK (red) |
| Minimum sample | 3 trades required before stats are shown (`MIN_SAMPLE = 3`) |

---

## Methodology Concepts (context for UI decisions)

| Concept | What it means |
|---------|--------------|
| **Liquidity Sweep** | Price takes out a high/low to grab liquidity before reversing |
| **CISD** | Change in State of Delivery — shift in order flow |
| **SMT Divergence** | One pair makes a new high/low while the correlated pair fails to |
| **PSP** | Preferred Swing Point — structural entry reference |
| **C2–C4 model** | Entry on the 2nd–4th candle after the setup forms |
| **HTF Alignment** | Higher timeframe bias (Daily/H4/H1) all pointing same direction |
| **Premium/Discount** | Price position relative to the range midpoint |
| **FVG** | Fair Value Gap — imbalance in price delivery |
| **OB** | Order Block — institutional supply/demand zone |
| **PDH/PDL** | Previous Day High / Previous Day Low |

> These are display/label context only. Do not add new confluence factors without explicit instruction.

---

## What Claude Code Must Never Do

- Add new pairs beyond EURUSD / GBPUSD without instruction
- Add new session times or change session labels
- Change the C5+ hard block behaviour
- Add confluence factors not in CONF_ALL
- Change Key Zone options without instruction
- Allow NT trades to have outcome = NT (hypo_outcome must be W/L/BE)
- Remove or rename any OUTCOMES values
- Change MIN_SAMPLE threshold without instruction
- Apply technical indicators (Moving Averages etc.) — fundamentals-only methodology
