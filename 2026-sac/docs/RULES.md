# SAC 2026 — Constraints and Rules

Reference document with all constraints defined for the group, staff, and team assignment
of the South American Championship 2026 (Bogota, Colombia, Jun 12-15).

---

## 1. Staff Teams

### Structure

- R1: There are **4 staff teams** (~27 people each, ~108 total in pool).
- R2: Each team has **3 Team Leads** (12 total). TLs supervise groups (Delegate role).
- R3: Each team has Jr/Trainee delegates who work as regular staff.
- R4: Each team has non-delegate volunteers.

### Team Lead Selection Criteria

- R5: Every TL must be an **active delegate** (listed in `org-delg`).
- R6: Selection prioritizes:
  1. **1 BR-TL per team** (4 confirmed Brazilians).
  2. **1 CO-TL per team** (4 confirmed Colombians).
  3. **Higher rank = more weight** (Full > Regional > Junior).
  4. **Fewer events = more availability** as a supervisor.

### Confirmed Team Leads (12)

| Team | TL 1 (CO) | TL 2 (BR) | TL 3 |
|------|-----------|-----------|------|
| T1 | JN Pinzon (Jr) | Pedro Miranda (Regional) | Ondet (Full, FR) |
| T2 | Haiver Reyes (Jr) | Marlon Marques (Full) | Josias Sirpa (Jr, BO) |
| T3 | Manuel Popayan (Jr) | Lucas Yunomae (Full) | Acosta (Full, PY) |
| T4 | Sergio Ibarra (Full) | Thales Souza (Jr) | Sanchez (Full, VE) |

### Delegates Excluded from Team Lead

- Joel Hernandez (SV Full), Cristian Vega (AR Full), Felipe Rojas (CL Full),
  Marvin Solano (CR Junior) — do not assign supervisory responsibility.
- Reategui (PE Full), Gustavo (PY Full), Suzuki (PE Full) — dropped due to 3 TL/team limit.
- Daniel (BO Jr), Fabricio (BO Jr), Axel (CL Jr), Jose Gaete (CL Jr), Rocio (MX Jr),
  Ronny (EC Jr) — dropped due to BR/CO constraints or max TL limit.
- JF Gomez (CO Jr) — self-excluded, free coordinator.

---

## 2. Zones and Rotation

### Competition Zones

| Zone | Type |
|------|------|
| Zona Amarilla | Main (official) |
| Zona Azul | Main (official) |
| Zona Roja | Main (official) |
| Zona Morada | Blindfolded events (BLD) |
| Zona Verde (TARIMA) | Unofficial events |

### Daily Rotation

- R7: Each day, 3 teams cover the main zones (one per room).
- R8: Each day, 1 team is the **floater**: covers BLD + unofficial events + support.
- R9: The floater **rotates** each day.

| Day | Amarilla | Azul | Roja | Floater |
|-----|----------|------|------|---------|
| D1 Fri | T1 | T2 | T3 | **T4** |
| D2 Sat | T2 | T3 | T4 | **T1** |
| D3 Sun | T3 | T4 | T1 | **T2** |
| D4 Mon | T4 | T1 | T2 | **T3** |

- R10: Staff always **compete in their team's zone** that day (except floater).
  Implemented with StaffRoomScorers. Compliance: 100%.

---

## 3. Stations per Group

### Main Rooms (Amarilla, Azul, Roja)

- R11: **10 judges** (stations) per zone per group.
- R12: **3 scramblers** per zone per group.
- R13: **3 runners** per zone per group.
- R14: **3 Delegates** (supervisors) per zone per group.
  - TLs are the primary supervisors; non-TL delegates act as backup.
- R15: Total per group per room: **19 staff** (10 + 3 + 3 + 3).

### BLD Room (Zona Morada)

- R16: **4-5 judges** per group.
- R17: **2 Delegates** per group. Eligibility open to any delegate.

### Unofficial Events (Zona Verde)

- R18: **8 judges + 2 scramblers + 2 runners + 1 Lead** (Maarten Goossens).
- R19: FTO R1 and Mirror Blocks R1 have reduced staffing due to schedule conflict
  with high-attendance events in main rooms.

---

## 4. Roles and Eligibility

- R20: **Only staff** receive assignments. Regular competitors never do.
- R21: **Team Leads** only supervise (Delegate role). Excluded from judge/scramble/run.
- R22: **Non-TL delegates** do judge/scramble/run AND can supervise as backup.
- R23: **Volunteers** do judge/scramble/run. They do not supervise.
- R24: **Score Takers** (3 people) are 100% data entry. Excluded from all regular jobs.
- R25: Every TL must be an active delegate.

### Score Takers

- R26: Fixed team of 3 people dedicated to data entry:
  1. Lais Helena Rega Serra Marques (BR, 1 event)
  2. Francia Perez (CO, 4 events)
  3. Adriana Saavedra Limachi (BO Trainee Delegate, 3 events)
- R27: Marked with `score-taker=true`. Excluded from judge/scramble/run/Delegate
  in all day scripts and unofficial.cs.

---

## 5. Conflict and Rest Constraints

- R28: **Never** assign someone to staff a group where they compete.
- R29: **Penalty** for consecutive groups: `FollowingGroupScorer(-50)`.
- R30: **Penalty** for overload: `JobCountScorer(-5)` per previous job.
- R31: Judge/scramble/run restricted to the room's team. Delegate can be from
  any team.
- R32: **Primary team priority** (+500): the assigned team always covers its room.
- R33: **Zone cohesion** (+100): within the primary team, prioritize whoever competes
  in that same room (fewer relocations).

---

## 6. People Outside the Pool

### Organizers (not operational staff)

- Diego Casas (2014JIME05)
- Eduard Garcia (2011EDUA01)
- Catalina Herrera (2017LOPE31)
- Joao Vinicius Santos (2016SANT66)

### Delegates without an operational role

- Guido Dipietro (2013DIPI01) — Senior Delegate / WCA Board
- Enrymar Cisneros (2013CISN01) — Regional Delegate

### Coordination / other tasks

- Juan Felipe Gomez Lopez (2021LOPE01) — Delegate-coordinator, free
- Juliana Garcia Uribe (2025URIB01) — Support in other tasks

### Streaming (dedicated)

- Luigi Segura (2018MELO07)
- Klaus Ramos (2016RAMO01)

### Unofficial events lead

- Maarten Goossens (2024GOOS03) — Zona Verde, outside the regular pool

### Not attending

- Michael Castillo (CO Jr), Nayarid Villarreal (VE Tr) — reported they will not attend.
- Ruben Lopez de Juan (ES Full), Alvaro Aguilar (ES Full) — remote support.
- Heron Sato (BR Full) — external organizer.
- Jorge Trigo (BO Full), Xavier Balderrama (BO Regional), Pedro Mora (CL Tr) — not contacted.

### Confirmed staff volunteer (Dennis Rosero)

- Dennis Rosero (2010ROSE03, CO) — no longer an active delegate. VOLUNTEER only
  (judge/scramble/run).

---

## 7. Team Clustering

- R34: Team size: min 22 (weight 32 in LimitConstraint).
- R35: Team Leads: min 3 per team + BalanceConstraint (weight 30).
- R36: BR-TLs: min 1 per team (weight 1000) + BalanceConstraint (weight 200).
- R37: CO-TLs: min 1 per team (weight 1000) + BalanceConstraint (weight 200).
- R38: Full TLs balanced (weight 30), Junior TLs balanced (weight 15).
- R39: All delegates balanced (weight 5).
- R40: Registered events balanced (weight 0.2).
- R41: Colombians balanced (weight 5), Brazilians balanced (weight 2).
- R42: BLD competitors balanced (weight 3-5).

---

## 8. Competitor Group Assignment

- R43: All groups of an event have a difference of at most 1 person.
- R44: Team leads are distributed first (priority 1).
- R45: Volunteer/delegate staff second (priority 2).
- R46: Regular competitors last (priority 3).
- R47: Country diversity: maximum 2 from the same country per group.
- R48: Competitors in the next event → assigned to early groups.

---

## 9. Unofficial Events

- R49: Held in **Zona Verde (TARIMA)**.
- R50: Staff assigned from the floater team of the day.
- R51: Events: Mirror Blocks, Kilominx, FTO, Team Blind 3x3.
- R52: 8 judges + 2 scramblers + 2 runners + 1 Lead (Maarten).
- R53: **FTO R1** has an unresolved schedule conflict (0 staff available due to overlap
  with 222+Pyram+333 R2). Schedule change pending.
