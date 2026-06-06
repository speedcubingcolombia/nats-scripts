# SAC 2026 — Pending Tasks

## Pre-deploy (antes del próximo deploy)

- [ ] **OH R1: 3→4 waves** — `_group_counts.cs` ya actualizado (GROUPS_333OH=4).
  Requiere: clear cache → create_groups.cs → pipeline completo → deploy.
  Baja de 41 a 31 comp/grupo-sala (cabe en 36 sillas de espera).
- [ ] **Johana Suarez** — Agregar como NCP en WCA (wcaId: 2024SUAR10, userId: 440824).
  Ya está en add_missing_staff.cs. Sin ella, WCA descarta ~47 asignaciones.
- [x] **Rubén López de Juan** — isCompeting=true resuelto 2026-05-31.
- [x] **Álvaro Aguilar Salobreña** — Se queda como NCP, sin cambios.

## Operativo — antes de la competencia

- [ ] **MBLD att2 pre-scrambling (D3)** — Submission 14:15-14:45, scrambling
  14:45-16:15 (1h30). TL de T2 coordina en Zona Morada.
- [ ] **MBLD att1 pre-scrambling (D2)** — Submission 16:10-16:40, gap 4h30 hasta
  21:10. Sin problema.

## Ad-hoc (during the event)

- [ ] **Mirror R1 G1 (D1)** — Sin staff ni Lead (todos en SQ1/Clock). Asignar
  manualmente en sitio. Mirror G2 tiene Lead (Maarten), G3 tiene Lead + 4j+1s+1r.
- [ ] **FTO R1 G1 (D3)** — Maarten compite en FTO G1, no puede ser Lead. 2 judges
  asignados. FTO G2 tiene Lead (Maarten), FTO G3 tiene Delegate (Sergio).
- [ ] **Unofficial R1 competidores** — No se asignan por pipeline. Los competidores
  se presentan al grupo que les convenga operativamente.
- [ ] **Angie Juliett** — Sin cuenta WCA. Tarea ad-hoc en sitio.
- [ ] **Midcomp group assignments** — R2+ scripts en `groups/midcomp/`. Ejecutar
  via `make deploy` conforme avanzan los resultados.

## Already resolved

- [x] **2026-05-27: Scrambler quality** — `can-scramble-{event}` eligibility + `scramble-quality` scorer (+300) en los 94 AssignStaff calls. 100% scramblers calificados, 97% quality≥2.
- [x] **2026-05-27: Zone enforcement clock** — -50000 para T1/T2/T3 en sala incorrecta en clock.cs. 0/618 violaciones de zona (100%).
- [x] **2026-05-27: Unofficial competitor assignments removed** — Phase 3.5 eliminado. Staff via unofficial.cs. Push scorers en R1 scripts mantenidos.
- [x] **2026-05-27: Judge min=0 for unofficial** — count≤4 → min=0 para que Lead se asigne aunque no haya judges disponibles.
- [x] **2026-05-27: Staff-comp conflict removal** — Phase 3.5 removía staff que chocaba con unofficial competitors. Ya no aplica (Phase 3.5 eliminado).
- [x] **2026-05-24: Overwrite fix** — `assign.js` usaba `assignment.code` en vez de `assignment.assignmentCode`.
- [x] **2026-05-24: BLD scrambler eligibility** — 4BLD exige `can-scramble-444`, 5BLD exige `can-scramble-555`.
- [x] **2026-05-24: Critical fix** — ManuallyAssign `[WCAID]` → `"WCAID"` string syntax.
- [x] **2026-05-24: Z-stripping fix** — lib.js + group.js strip Z from WCIF times.
- [x] **2026-05-24: Elias Acosta** withdrew. Suzuki promoted to TL.
- [x] Validaciones: 8/8 checks pasaron. 0 conflictos, 0 duplicados, familias juntas.
