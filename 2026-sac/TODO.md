# SAC 2026 — Pending Tasks

## Actions required outside of scripts

- [ ] **Angie Juliett** — Needs WCA portal account. Replace synthetic wcaUserId in
  `add_missing_staff.cs` once she has a real account.
- [ ] **Johana Suarez** — Registration pending in WCA. Approve as non-competing
  registration so pipeline can include her.
- [ ] **Nicolas Raubach Munari** — Streaming team, pending addition to overrides.

## Pending confirmation

- [ ] **Alvaro Aguilar Salobrena** — Pending if competing or not (2026-05-18).
- [ ] **Ruben Lopez de Juan** — Pending if competing or not (2026-05-18).

## Ad-hoc (during the event)

- [ ] **FTO R1 (Day 3)** — 0 staff available due to schedule conflict with
  222+Pyram+444bf. Staff recruited manually on-site.
- [ ] **Midcomp group assignments** — R2+ scripts in `groups/midcomp/`. Run via
  `make serve-prod` UI as results become available.

## Already resolved

- [x] **Deployed to WCA production** — 9,085 assignments, 222 groups, 597 persons
- [x] Production deploy uses **authenticated WCIF** (no remapping needed)
- [x] 4 teams × 25 staff, 12 Team Leads (3/team, 1 BR + 1 CO)
- [x] 4 Score Takers (Lais, Francia, Adriana, Valentina)
- [x] 3 Streaming (Luigi, Klaus, Ricardo Hurtado)
- [x] 14 judges + 3 scramblers + 3 runners (main rooms, flexible min)
- [x] 10 judges BLD (Zona Morada, float team only)
- [x] 8 judges + 2 scr + 2 run + 1 Lead (unofficial, float team only)
- [x] BLD groups: 555bf=2, 444bf=3, MBLD=1 per attempt
- [x] Delegate = TLs only (main team for principals, float for BLD)
- [x] Float team: -300 deprioritized on D2/D3 (BLD priority), +400 bonus on D1/D4
- [x] Mirror R1 (D1): staff assigned (6 staff including TLs as judges)
- [x] Scrambler distribution: can-scramble + quality scores (PRs) balanced across teams
- [x] BLD competitor overlap resolved (scorers in 222, pyram, 444, 333oh, 555)
- [x] Phase 0.5: scramble quality scores from WCIF personalBests
- [x] volunteer_properties.cs included in pipeline
- [x] CompScript Job() flexible min (Delegate=0, judge=count-4, scrambler/runner=count-1)
- [x] Jhonatan Reategui, Victor Solis, Angie Casallas removed from staff
- [x] Lucas Zvinys promoted trainee→junior
- [x] Ruben Lopez de Juan added as WCA Board (overrides)
- [x] Pipeline order: day scripts (BLD first) → unofficial last
- [x] Deploy cleans all persons before PATCH + fixes comments
- [x] Reports: team_leads, team_roster, staff_summary, volunteer_workload, group_schedule_overview
