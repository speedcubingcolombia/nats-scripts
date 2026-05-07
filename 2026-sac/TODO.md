# SAC 2026 — Pending Tasks

## Actions required outside of scripts

- [ ] **Angie Juliett** — Ask her to create a WCA portal account. Currently uses synthetic
  wcaUserId `9999803` which will cause the PATCH to fail. Replace in `add_missing_staff.cs`
  once she has a real account.

## Pending implementation

- [ ] **FTO R1 — schedule change** — 0 staff available due to conflict with
  222+Pyram+333 R2. Options: move to morning (7:00 AM any day) or reduce duration.
- [ ] **Phase 2.5 in UI mode** — The pure JS in `run_pipeline.js` (tagging
  `compete-d{N}-{slug}`) does not run from the server UI. Not an issue when
  deploying via `make deploy` (runs full pipeline locally).

## Live (during the event)

- [ ] **Midcomp group assignments** — Scripts in `groups/midcomp/`. Run via
  `make serve-prod` UI as results become available.

## Already resolved

- [x] **Deployed to WCA production** — 8,319 assignments, 219 groups, 517 persons
- [x] `.env.PROD` configured with OAuth
- [x] Production deploy workflow: `make deploy`, `make deploy-restore`, `make backup`, `make verify`
- [x] Verification: 7/7 checks passed (zone compliance 100%, TLs, score takers, etc.)
- [x] Staff pool complete (108 in cluster + 11 outside the pool)
- [x] 12 Team Leads (3/team, 1 BR + 1 CO per team)
- [x] Score takers implemented (Lais, Francia, Adriana — excluded from regular jobs)
- [x] STAGE_LEAD renamed to LISTED_DELEGATE
- [x] Constraints: BR-TL, CO-TL, rank balance, Country CO/BR
- [x] 10 judges + 3 scramblers + 3 runners (main rooms)
- [x] 8 judges + 2 scramblers + 2 runners (unofficial events)
- [x] Staff competes in their zone (100% compliance)
- [x] 3-phase pipeline + Phase 2.5
- [x] Streaming (Luigi + Klaus), organizers, coordinators outside the pool
- [x] Nayarid Villarreal, Michael Castillo removed (not attending)
- [x] Felipe Rojas via AddPerson (NOT TL)
- [x] 13 volunteers from `voluntarios listado.xlsx` via AddPerson
- [x] Fix SpecificAssignmentScore `let out` bug
- [x] HTML reports generated (5 reports)
- [x] Project reorganized (data/sources, data/outputs, reports/html, backups)
- [x] All docs translated to English
- [x] Docs renamed: REGLAS→RULES, ANALISIS→STATION_ANALYSIS, GUIDE→EXPLANATION
- [x] New doc: PEOPLE.md (TLs, exclusions, score takers, pool status)
- [x] Git: all commits pushed, .gitignore updated, personal data excluded
