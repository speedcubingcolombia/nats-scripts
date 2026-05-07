# SAC 2026 — Station and Staff Capacity Analysis

## Context

SAC 2026 has 3 main zones (Amarilla, Azul, Roja) running events simultaneously.
Each zone needs staff for every group: judges + 3 scramblers + 3 runners + 3 Delegates.

The question: **how many judges (stations) can we assign per group?**

---

## Current Staff Pool

| Concept | Count |
|---------|-------|
| Total staff in pool | 108 |
| Teams | 4 (~27 each) |
| TLs per team (supervise only) | 3 |
| Score takers (excluded from jobs) | 3 |
| **Available workers per team** | **~21-24** |
| Floater (support, 1 team/day) | ~24 extra workers |

### Workers per team (excluding TLs and score takers)

| Team | Total | TLs | Score Takers | Workers |
|------|-------|-----|--------------|---------|
| T1 | 27 | 3 | 0 | 24 |
| T2 | 27 | 3 | 1 (Francia) | 23 |
| T3 | 27 | 3 | 0 | 24 |
| T4 | 27 | 3 | 2 (Lais + Adriana) | 22 |

---

## Analysis by Judge Configuration

Fixed: **3 scramblers + 3 runners + 3 Delegates = 9 fixed staff per group**.
Variable: **N judges (stations)**.
Total per group = N + 9.

### Primary team availability (without floater)

In the worst case, ~7 workers from the primary team are competing in a given group.
Worst case available = min(workers) - max(competing) = **12 workers**.

| Judges | Total/group | Primary covers alone? | With floater? | Margin with floater |
|--------|-------------|----------------------:|:-------------:|--------------------:|
| **8** | 17 | Tight (12 avail) | Yes | +19 |
| **10** | 19 | Not in worst case | Yes | +17 |
| **12** | 21 | No (12 avail) | Yes | +15 |
| **14** | 23 | No | Yes (tight) | +13 |
| **16** | 25 | No | Limit | +11 |

*Floater provides ~24 workers split across the 3 rooms needing support (~8/room).*

### Detailed analysis by percentile

| Percentile | Available workers (primary) | Covers 8j? | Covers 10j? | Covers 12j? | Covers 14j? | Covers 16j? |
|-----------|-------------------------------|:---------:|:----------:|:----------:|:----------:|:----------:|
| Worst case (P0) | 12 | -5 | -7 | -9 | -11 | -13 |
| P5 | 13 | -4 | -6 | -8 | -10 | -12 |
| P10 | 14 | -3 | -5 | -7 | -9 | -11 |
| P25 | 15 | -2 | -4 | -6 | -8 | -10 |
| **Median (P50)** | **17** | 0 | -2 | -4 | -6 | -8 |
| P75 | 19 | +2 | 0 | -2 | -4 | -6 |
| P90 | 21 | +4 | +2 | 0 | -2 | -4 |
| Best case | 24 | +7 | +5 | +3 | +1 | -1 |

*(Negative numbers = floater needed to cover the difference)*

---

## With Floater Support

The floater team has ~24 workers. In the worst moment, all 3 rooms need
support simultaneously → ~8 floaters per room.

| Config | Need/group | Primary worst | Deficit | Floater covers? |
|--------|:---------:|:------------:|:-------:|:---------------:|
| 8j + 3s + 3r | 17 | 12 | 5 | Yes (8 available/room) |
| 10j + 3s + 3r | 19 | 12 | 7 | Yes (8 available/room) |
| **12j + 3s + 3r** | **21** | **12** | **9** | Tight (needs most of the floater) |
| 14j + 3s + 3r | 23 | 12 | 11 | Tight (exceeds 8/room, needs all) |
| 16j + 3s + 3r | 25 | 12 | 13 | No (floater insufficient) |

---

## Conclusion and Recommendation

**Current configuration: 10 judges** — works well. The primary team covers most
groups (median 17 available vs 19 needed = floater provides 2). In the worst case
the floater provides 7 (out of 8 available per room).

**Could increase to 12 judges** — viable but consumes nearly all of the floater in the worst
groups. The floater team loses flexibility for BLD/unofficial events/ad-hoc support.

**Not recommended 14+** — requires the floater to dedicate ALL workers to main rooms,
leaving BLD and unofficial events without coverage.

| Judges | Recommendation |
|--------|----------------|
| 8 | Conservative. Staff surplus. |
| **10** | **Optimal balance. Current config.** |
| 12 | Aggressive but viable. No floater margin. |
| 14 | Risky. BLD and unofficial events left uncovered. |
| 16 | Not viable with the current pool. |

---

## Unofficial Events (Zona Verde)

Current config: **8 judges + 2 scramblers + 2 runners + 1 Lead = 13 staff**.

Unofficial event staff comes from the floater team. If the main rooms use more than
10 stations, the floater has fewer people for unofficial events.

| Main rooms | Floater for unofficial | Covers 13? |
|------------|------------------------|:----------:|
| 10j (current) | ~17 free | Yes |
| 12j | ~9 free | Tight |
| 14j | ~1 free | No |

---

## Source Data

- Pool: 108 staff in cluster (27/27/27/27 per team)
- 12 TLs (supervise only, not counted as workers)
- 3 Score takers (excluded)
- 219 official groups analyzed
- Worst case: 3x3 OH R1 G1 in Zona Amarilla (7 workers from the primary team competing)
