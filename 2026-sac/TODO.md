# SAC 2026 — Pending Tasks

## Pre-deploy (next deploy)

- [ ] **Rubén López de Juan** — Reabrir registro mañana (2026-05-25 mediodía) para
  cambiar isCompeting=true. Pipeline ya le asigna 12 grupos correctamente.
- [ ] **Johana Suarez** — Aprobar registro non-competing en WCA para que aparezca
  en WCIF oficial.

## Pending confirmation

- [ ] **Álvaro Aguilar Salobreña** — Pending if competing or not (desde 2026-05-18).

## Operativo — antes de la competencia

- [ ] **MBLD att2 pre-scrambling (D3)** — Submission 14:15-14:45, scrambling
  14:45-16:15 (1h30). TL de T2 coordina en Zona Morada. José Libardo libre
  todo el gap. Sergio Estupiñán disponible hasta 15:40 (3OH G1).
- [ ] **MBLD att1 pre-scrambling (D2)** — Submission 16:10-16:40, gap 4h30 hasta
  21:10. Sin problema.

## Ad-hoc (during the event)

- [ ] **Mirror R1 (D1)** — 0 staff automático. 4 T4 libres (Story, Carlos,
  Marcela, Johana) pero solver falla por scrambler=0 + Lead no disponible.
  Asignar manualmente en sitio.
- [ ] **Kilominx R1 (D2)** — 0 staff automático. 5 T1 con solo 15 min de
  overlap con 555bf. Cubrir ad-hoc hasta ~14:55.
- [ ] **FTO R1 (D3)** — 0 staff automático. 3 horas solapadas con 222+Pyram+444bf.
- [ ] **TB R1 (D3)** — 0 staff automático. 3 horas solapadas con 333oh+MBLD.
- [ ] **Angie Juliett** — Sin cuenta WCA. Tarea ad-hoc en sitio.
- [ ] **Midcomp group assignments** — R2+ scripts en `groups/midcomp/`. Ejecutar
  via `make serve-prod` conforme avanzan los resultados.

## Already resolved

- [x] **2026-05-24: Overwrite fix** — `assign.js` usaba `assignment.code` en vez
  de `assignment.assignmentCode`. ManuallyAssign+AssignGroups generaba duplicados.
- [x] **2026-05-24: BLD scrambler eligibility** — 4BLD exige `can-scramble-444`,
  5BLD exige `can-scramble-555`. Antes asignaba scramblers sin esa habilidad.
- [x] **2026-05-24: T2 TLs en 3OH G1** — Push T2 TLs a G1 de 3OH (15:40-16:15)
  para que estén libres como Delegate en MBLD att2 (16:15). BLD > unofficial.
- [x] **2026-05-24: Critical fix** — ManuallyAssign `[WCAID]` → `"WCAID"` string
  syntax. D2-D4 events had 0 competitor group assignments (1515 → 4083).
- [x] **2026-05-24: Z-stripping fix** — lib.js + group.js strip Z from WCIF times.
  Time-based ByFilters scorers were silently broken (UTC vs local mismatch).
- [x] **2026-05-24: Float push scorers** — Push float team to first/last groups of
  events overlapping with unofficial: SQ1→G1, Clock→G1, 5x5→G3, 4x4→G1,
  3x3→G1-G3, 2x2→G1, Pyram→G5.
- [x] **2026-05-24: Elias Acosta** (2016ACOS08) withdrew. Removed from import.cs,
  333.cs ManuallyAssign. Andrés Suzuki (2016SUZU03) promoted to TL.
- [x] 4 teams: T1=25, T2=25, T3=25, T4=24. 12 TLs (3/team).
- [x] 4 Score Takers (Lais, Francia, Adriana, Valentina)
- [x] 3 Streaming (Luigi, Klaus, Ricardo Hurtado)
- [x] 14 judges + 3 scramblers + 3 runners (main rooms, flexible min)
- [x] 8 judges BLD (Zona Morada, float team only)
- [x] 8 judges + 2 scr + 2 run + 1 Lead (unofficial finals, float team only)
- [x] BLD groups: 555bf=2, 444bf=3, MBLD=1 per attempt
- [x] Delegate = TLs only (main team for principals, float for BLD)
- [x] Float team: -300 deprioritized on D2/D3 (BLD priority), +400 bonus on D1/D4
- [x] Scrambler distribution: can-scramble + quality scores (PRs) balanced across teams
- [x] Phase 0.5: scramble quality scores from WCIF personalBests
- [x] CompScript Job() flexible min (Delegate=0, judge=count-4, scrambler/runner=count-1)
- [x] Pipeline order: day scripts (BLD first) → unofficial last
- [x] Deploy cleans all persons before PATCH + fixes comments
- [x] NEVER PATCH schedule to WCA
