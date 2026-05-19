# SAC 2026 — Constraints and Rules

Reference document with all constraints for the South American Championship 2026
(Bogota, Colombia, Jun 12-15).

---

## 1. Staff Teams

- **4 teams** of 25 people each (100 total in pool).
- Each team has **3 Team Leads** (12 total). TLs are the only Delegates (supervisors).
- Each team has Jr/Trainee delegates who work as regular staff.
- Each team has non-delegate volunteers.

### Team Lead Selection

- 1 BR-TL per team (mandatory, weight 1000).
- 1 CO-TL per team (mandatory, weight 1000).
- Higher rank = more weight (Full > Regional > Junior).
- Fewer events = more availability.

### Scrambler Distribution

- Scramblers balanced across teams using `can-scramble-{event}` + `scramble-quality-{event}`.
- Quality score 0-3: 0=can't, 1=can but no PR, 2=has PR, 3=elite (continental rank ≤200).
- LimitConstraint for scarce events (777, 666, sq1, clock, minx): min 5-8 per team.
- BalanceConstraint for headcount + quality distribution.

---

## 2. Zones and Rotation

| Zone | Type |
|------|------|
| Zona Amarilla | Main (official) |
| Zona Azul | Main (official) |
| Zona Roja | Main (official) |
| Zona Morada | BLD events (official) |
| Zona Verde (TARIMA) | Unofficial events |

### Daily Rotation

| Day | Amarilla | Azul | Roja | Float |
|-----|----------|------|------|-------|
| D1 Fri | T1 | T2 | T3 | **T4** |
| D2 Sat | T2 | T3 | T4 | **T1** |
| D3 Sun | T3 | T4 | T1 | **T2** |
| D4 Mon | T4 | T1 | T2 | **T3** |

### Float Team Rules

- Float team covers **BLD (Morada)** and **unofficial (Verde)** as priority.
- **D2/D3** (BLD days): float **deprioritized** in main zones (scorer -300) — BLD has priority.
- **D1/D4** (no BLD): float gets **+400 bonus** in main zones — helps freely.
- BLD and unofficial use **only float team** staff (eligibility restricted).
- TLs on float day: Delegate in BLD, judge/scr/run in unofficial. Cannot be Delegate in main zones.
- Pipeline order: day scripts (BLD first inside each day) → unofficial last.

---

## 3. Stations per Group

### Main Rooms (Amarilla, Azul, Roja)

- **14 judges** (stations) per zone per group (flexible min=10).
- **3 scramblers** per zone per group (flexible min=2).
- **3 runners** per zone per group (flexible min=2).
- **1-3 Delegates** (TLs only, from main team; flexible min=1).
- Scramblers filtered by `can-scramble-{event}` eligibility.
- Scramblers prioritized by `scramble-quality-{event}` scorer (+200 for proven).

### BLD Room (Zona Morada)

- **10 judges** per group (flexible min=4). Float team only.
- **1-3 Delegates** (float team TLs). Flexible min=0.
- No scramblers/runners (BLD events don't need them).
- Groups: 555bf=2 groups (8 comp each), 444bf=3 groups (8 each), MBLD=1 group.

### Unofficial Events (Zona Verde)

- **8 judges + 2 scramblers + 2 runners + 1 Lead** (Maarten Goossens).
- Float team only (eligibility restricted).
- Mirror R1 (D1) and FTO R1 (D3): reduced to 4J+1S+1R or handled ad-hoc
  due to schedule conflicts with main events.
- Scrambler eligibility: `can-scramble-333` + `pref-scrambler ≥ 7` scorer.

---

## 4. Roles and Eligibility

- **Team Leads**: Delegate (supervisor) only. Excluded from judge/scramble/run.
  Only TLs from the main team assigned to that zone that day.
- **Non-TL delegates**: judge/scramble/run. NOT Delegate role.
- **Volunteers**: judge/scramble/run.
- **Score Takers** (4): dedicated data entry. Excluded from all regular jobs.

### Score Takers

1. Lais Helena Rega Serra Marques (BR, 1 event)
2. Francia Perez (CO, 4 events)
3. Adriana Saavedra Limachi (BO Trainee Delegate, 3 events)
4. Valentina Sanchez Munoz (CO, 4 events)

---

## 5. Flexible Job Constraints (CompScript assign.js)

Jobs have a `min` parameter hardcoded by name:
- `Delegate`: min=0 (0-3 TLs depending on availability, +1000 bonus per slot filled)
- `judge`: min=count-4 (e.g., 14→min 10)
- `scrambler`: min=count-1 (e.g., 3→min 2)
- `runner`: min=count-1 (e.g., 3→min 2)
- All others: min=count (strict)

This allows the solver to find solutions when not enough people are available,
rather than failing the entire group.

---

## 6. Conflict Avoidance

- Never assign someone to staff a group where they compete.
- `FollowingGroupScorer(-50)`: penalty for consecutive groups.
- `JobCountScorer(-5)`: penalty per previous job (spreads workload).
- BLD competitors pushed to non-conflicting groups in main events
  (scorers in 222.cs, pyram.cs, 444.cs, 333oh.cs, 555.cs).
- Float TLs pushed to early groups of 222 and late groups of pyram
  to be free for 444bf.
- TLs spread across groups of 555 so each group has ≥1 Delegate.

---

## 7. Team Clustering Constraints

- Team size: min 22 (weight 32).
- Team Leads: min 3/team + balance (weight 30).
- BR-TLs: min 1/team (weight 1000) + balance (weight 200).
- CO-TLs: min 1/team (weight 1000) + balance (weight 200).
- Full TLs balanced (weight 30), Junior TLs balanced (weight 15).
- All delegates balanced (weight 5).
- Scramblers: LimitConstraint + BalanceConstraint for scarce events.
- Scramble quality: BalanceConstraint per event (weight 5-15).
- Registered events balanced (weight 0.2).
- Colombians balanced (weight 5), Brazilians balanced (weight 2).
- BLD competitors balanced (weight 3-5).

---

## 8. Production Deploy

Pipeline uses **authenticated WCIF** (not public) to ensure correct activity IDs.
Flow:
1. OAuth authorization → get token
2. Fetch authenticated WCIF (has all persons + correct activity IDs)
3. Reset (clear assignments/extensions/childActivities)
4. Phase 0.5: compute scramble quality scores
5. Phase 1: import + teams
6. Phase 2: group assignments
7. Phase 2.5: compete-room tagging
8. Phase 3: staff assignments (day scripts + unofficial)
9. PATCH schedule
10. Clean all persons (clear assignments)
11. Fix comments
12. PATCH persons
