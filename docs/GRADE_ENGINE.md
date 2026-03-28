# NV Grade Engine — v1
> Read this before touching ANY grading logic in NVJournal_source.html

---

## Core Rules

- Scores are **stored on save** — never recalculate old trades against a new model
- Grade model version must be tracked separately from app version
- C5+ on ANY entry timeframe (Daily, H4, H1) = hard block, grade B, no exceptions
- Execution grades: **A+ and A only** — B/C are logged but not traded

---

## Score Range

- **0–35 pts**, capped at 35
- Stored as `grade_score` on the trade record

---

## Hard Blocks (checked first, return immediately)

| Block | Condition | Result |
|-------|-----------|--------|
| C5+ Candle | `daily_candle`, `h4_candle`, or `h1_candle` === "C5+" | Grade B, blocked |
| H1 Bias Conflict | H1 bias conflicts with trade direction | Grade B, blocked |
| HTF < 2 aligned | Fewer than 2 of Daily/H4/H1 aligned | Grade B, blocked |
| No Major Signal | No sweep H4, no sweep H1, no SMT H4, no SMT H1 | Grade B, blocked |

---

## HTF Alignment Logic

| State | Condition | A+ Eligible |
|-------|-----------|-------------|
| Full Align | Daily + H4 + H1 all aligned | ✅ Yes |
| H4 + H1 | H4 + H1 aligned, Daily not | ❌ Max A |
| Daily + H1 | Daily + H1 aligned, H4 not | ❌ Max A |

H1 is always implicitly required (trade direction).

---

## Scoring Factors

| Factor | Key | Points | Notes |
|--------|-----|--------|-------|
| Sweep H4 | `sweep_h4` | 4 | Major signal |
| Sweep H1 | `sweep_h1` | 4 | Major signal |
| SMT H4 | `smt_h4` | 4 | Major signal |
| SMT H1 | `smt_h1` | 4 | Major signal |
| CISD H1 | `cisd_h1` | 3 | Required for A/A+ |
| 5M CISD | `ltf_5m_cisd` | 2 | Required for A+ |
| Premium/Discount | `discount_prem` | 2 | |
| Key Zone | `key_zone` (not "None") | 2 | Required for A/A+ |
| CISD H4 | `cisd_h4` | 1 | |
| Displacement | `displacement` | 1 | |
| Daily Alignment | `daily_bias` matches direction | 2 | Part of HTF pts |
| H4 Alignment | `h4_bias` matches direction | 2 | Part of HTF pts |
| H1 Alignment | always present | 1 | Base HTF pt |
| H1 Phase: Expansion | `h1_phase` === "Expansion" | 2 | Phase bonus |
| H1 Phase: Continuation | `h1_phase` === "Continuation" | 1 | Phase bonus |
| H1 Phase: Consolidation | `h1_phase` === "Consolidation" | 0 | No bonus |

**Max theoretical: 4+4+4+4+3+2+2+2+1+1 = 27pts from signals, capped at 35 with alignment/phase. Effective cap: 35.**

---

## Sweep Combo (required for A+)

Valid combos (any one of):
- Sweep H4 + Sweep H1
- Sweep H4 + SMT H1
- Sweep H1 + SMT H4
- SMT H4 + SMT H1

---

## Grade Thresholds

### A+ Conditions (ALL required)
- Full alignment (Daily + H4 + H1)
- CISD H1 ✅
- 5M CISD ✅
- Valid sweep combo ✅
- Key Zone present (not "None") ✅

### A Conditions (ALL required)
- Any 2 HTFs aligned
- CISD H1 ✅
- Key Zone present ✅
- At least 1 major signal (any sweep or SMT)

### B
- Passes hard blocks but fails A/A+ conditions
- OR: C5+ triggered (always B regardless of score)

### C
- Reserved (not currently used in v1 — threshold logic TBD for v2)

---

## Grade Display Rules

| Grade | Execution Status | Color |
|-------|-----------------|-------|
| A+ | ✓ EXECUTE | Green |
| A | ✓ EXECUTE | Green |
| B | ⚠ LOW QUALITY | Yellow |
| Blocked | ✗ HARD BLOCK | Red |

---

## NT Trades

- `hypo_outcome`: W / L / BE only
- `hypo_result` and `r_result` auto-filled
- Displayed on TradeRow as muted bracketed result
- Grade still calculated and stored

---

## Candle Position Options

`C2`, `C3`, `C4`, `C5+`

Applied to: `daily_candle`, `h4_candle`, `h1_candle`

---

## SMT Pairs

`EURUSD`, `GBPUSD`, `DXY`

---

## Model Versioning

| Version | Score Range | Status |
|---------|-------------|--------|
| v1 | 0–35 pts | **Current — live in v60** |
| v2 | 0–20 pts | Scoped, not built |

**Never apply v2 logic to trades stored under v1. Model version must be stored with the grade on save.**

---

## Function Reference (NVJournal_source.html)

| Function | Line | Purpose |
|----------|------|---------|
| `calcGrade(s)` | ~384 | Main grade calculator — takes trade object, returns `{grade, score, rows, blocked, fullAlign}` |
| `calcGradeSimple(t)` | ~380 | Returns numeric: A+=3, A=2, B/C=1 |

> ⚠️ Do not modify `calcGrade` without reading this file first and confirming model version intent.
