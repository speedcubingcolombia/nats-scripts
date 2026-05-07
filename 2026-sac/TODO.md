# SAC 2026 — Pending Tasks

## Actions required outside of scripts

- [ ] **Angie Juliett** — Ask her to create a WCA portal account. Currently uses synthetic
  wcaUserId `9999803` which will cause the PATCH to fail. Replace in `add_missing_staff.cs`
  once she has a real account.
- [ ] **`.env.PROD`** — Configure with OAuth for production push.

## Pending implementation

- [ ] **FTO R1 — schedule change** — 0 staff available due to conflict with
  222+Pyram+333 R2. Options: move to morning (7:00 AM any day) or reduce duration.
- [ ] **Phase 2.5 in UI mode** — The pure JS in `run_pipeline.js` (tagging
  `compete-d{N}-{slug}`) does not run from the server.
  - (a) Rewrite as CompScript.
  - (b) Rely on local pipeline for production; UI only for adjustments.
- [ ] **Push to production** — When `.env.PROD` is ready.

## Live (during the event)

- [ ] **Midcomp group assignments** — Scripts in `groups/midcomp/`.

## Already resolved

- [x] Staff pool complete (108 in cluster + 11 outside the pool)
- [x] 12 Team Leads (3/team, 1 BR + 1 CO per team)
- [x] Score takers implemented (Lais, Francia, Adriana — excluded from regular jobs)
- [x] STAGE_LEAD renamed to LISTED_DELEGATE
- [x] Constraints: BR-TL, CO-TL, rank balance, Country CO/BR
- [x] 10 judges + 3 scramblers + 3 runners (main rooms)
- [x] 8 judges + 2 scramblers + 2 runners (unofficial events)
- [x] Staff competes in their zone (R10, 100%)
- [x] 3-phase pipeline + Phase 2.5
- [x] Streaming (Luigi + Klaus), organizers, coordinators outside the pool
- [x] Nayarid Villarreal, Michael Castillo removed (not attending)
- [x] Felipe Rojas via AddPerson (NOT TL)
- [x] 13 volunteers from `voluntarios listado.xlsx` via AddPerson
- [x] Fix bug SpecificAssignmentScore `let out`
- [x] HTML reports generated (5 reports)
