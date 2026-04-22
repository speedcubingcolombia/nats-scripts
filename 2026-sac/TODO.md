# SAC 2026 — Pendientes

## Acción requerida fuera de scripts

### 📝 Registrar oficialmente a Felipe Rojas Garces (opcional)

Felipe (2009GARC02, CL, wcaUserId=273) **no está en la planilla oficial de registro** (`Status='b'`). Hoy lo agregamos al pipeline vía `AddPerson` en `add_missing_staff.cs` (aparece como non-competing staff + Full Delegate + Team Lead de T3).

Al hacer PATCH del WCIF a WCA, la persona quedará como "non-competing registration" en el portal. Si preferís que aparezca como registro normal, hay que aprobarlo manualmente en el portal antes del PATCH.

## Implementación pendiente en scripts

- [ ] **Score takers (R46-R49)** — Definir equipo de 4-5 personas y agregar script.
- [ ] **Fase 2.5 en modo UI** — Cuando se corren scripts uno a uno desde el servidor, la Fase 2.5 (JS puro en `run_pipeline.js`) no se ejecuta → las propiedades `compete-d{N}-{slug}` no se setean → el bonus +100 de cohesión queda inerte. Opciones:
  - (a) Reescribir Fase 2.5 como CompScript (usando `Persons(filter)` + `SetProperty`) y correrlo manualmente tras las asignaciones de grupo.
  - (b) Confiar en el pipeline local para producción y dejar la UI solo para ajustes.

## Nota sobre delegates en zonas

Cada team tiene 3 team leads (=3 delegates). Asignación formal en el WCIF:
- **Main rooms**: `Job("Delegate", 3)` — los 3 team leads del team primario quedan asignados. Si alguno compite en un grupo específico, `avoidConflicts` lo excluye de ese grupo (puede quedar con 2 delegates en ese grupo). Verificado: 214/215 grupos con 3, 1 con 2.
- **BLD (Sala Morada)**: `Job("Delegate", 2)` (R16) — eligibility abierta a cualquier delegate; scorer +300 al team flotante.
- **3BLD en main rooms**: `Job("Delegate", 3)` — igual que main rooms (se aplicó el mismo patrón).

La garantía de "siempre hay ≥1 team lead libre por grupo" se cumple naturalmente con la distribución actual de competidores (verificado: 0 violaciones en 215 grupos).

## Personas

### Team leads confirmados (13 total — T4 con 4)

| Equipo | Leads |
|--------|-------|
| T1 | Manuel Popayán (CO), Pedro Miranda (BR), Joel Hernández (SV) |
| T2 | Haiver Reyes (CO), Michael Castillo (CO), Rocío Rodríguez (MX) |
| T3 | Ronny Morocho (EC), Sergio Guillen (CO), Felipe Rojas (CL) |
| T4 | João Vinícius (BR), Cristian Vega (AR), Jose "Coto" Gaete (CL), Marvin Solano (CR) |

Cluster con `LimitConstraint("Team Leads", ..., 3, 4)` — 3 mínimo, 4 máximo por team. La distribución exacta puede variar entre corridas (clusterer es no-determinista).

### Confirmados como staff pero NO team lead

- **Dennis Rosero** (2010ROSE03, CO) — Full Delegate, participa como staff regular (juez/scrambler/runner/supervisor) pero no como team lead.

### Delegados bajados de team lead (disponibles si se necesitan)

Alexandre Ondet (FR), Andrés Suzuki (PE), Elias Acosta (PY), Jhonatan Reategui (PE), Lucas Ichiro (BR), Marlon Marques (BR), Rafael Sanchez (VE), Dennis Rosero (CO)

### Fuera del pool de staff

- Luigi Segura (2018MELO07) — Streaming
- Klaus Ramos (2016RAMO01) — Streaming
- Guido Dipietro (2013DIPI01) — Sin rol operativo
- Enrymar Cisneros (2013CISN01) — Sin rol operativo
- Diego Casas (2014JIME05) — Organizador
- Eduard García (2011EDUA01) — Organizador
- Catalina Herrera (2017LOPE31) — Organizadora
- Maarten Goossens (2024GOOS03) — Lead de no oficiales (asignado a cada evento vía `unofficial_lead`)

### Rechazados en SAC2026-registration.xlsx (Status='b')

- **Felipe Rojas Garces** (2009GARC02, CL) — agregado vía `AddPerson` como team lead (ver acción requerida arriba)
- **Antonio Castro Costa Filho** (2023FILH05, BR) — solo competidor, sin Cargo

### Staff pendiente de registro (12 WCA IDs comentados en `import.cs`)

Ninguno aparece aún en `SAC2026-registration.xlsx`:

- **Delegate**: 2015TRIG02 (Full, Team Lead), 2015BALD03 (Regional), 2017PERE38, 2023SILV92 (Trainees)
- **Voluntario**: 2025BELT01, 2022LIZA02, 2025MONG07, 2024SUAR10, 2015RODR37, 2025CARD14, 2025FAND01, 2025DELG07

Si alguno se registra: descomentar línea PENDING en `import.cs`, agregarlo al SetProperty del rango correspondiente, re-correr `make pipeline`.

## Ya resuelto

- [x] Fetch WCIF público actualizado
- [x] Integrar lista definitiva de staff desde `SAC2026-registration.xlsx` (104 aprobados)
- [x] Excluir Diego Casas, Eduard García, Catalina Herrera del pool (Organizadores)
- [x] Agregar Maarten Goossens como "Lead" de no oficiales (fuera del pool regular)
- [x] Remover 6 delegados no aprobados del staff (Brian Hambeck, Gabriel Sargeiro, Israel Fraga, Kalani Oliveira, Mateo Aguirre, Antonio Castro)
- [x] Dennis Rosero confirmado como staff regular (no team lead)
- [x] Agregar Felipe Rojas vía `AddPerson` como Full Delegate + Team Lead
- [x] Promover 3 nuevos team leads: Marvin Solano, Michael Castillo, Jose "Coto" Gaete
- [x] Sergio Guillen mantenido como team lead
- [x] Staff compite en su zona asignada (R58, 100%)
- [x] Pipeline de 3 fases + Fase 2.5 (compete-room tagging)
- [x] Equipo flotante como refuerzo con prioridad al primario (R59, +500)
- [x] Cohesión de zona al staffear (R60, +100 vía `compete-d{N}-{slug}`)
- [x] Decidir estaciones oficiales → 10 jueces + 3 scramblers + 3 runners
- [x] Decidir estaciones no oficiales → 9 jueces + 2 scramblers + 2 runners + 1 Lead (Maarten), sin delegado
- [x] Zona Verde: `unofficial.cs` con AssignMisc para 8 eventos — todos asignados (2 con staffing reducido por combinación de conflicto de horario + Delegate=3 en main: Mirror Blocks R1 con 1+3+1+1=6, FTO R1 solo con Maarten=1)
- [x] BLD (4BLD/5BLD/MBLD): 2 Delegates por grupo. Eligibility de Delegate abierta a cualquier team lead (+300 bonus al flotante) — permite rotación con los 3 team leads del flotante.
- [x] Main rooms: Delegate=3 por grupo (los 3 team leads del team primario quedan asignados formalmente; avoidConflicts excluye a los que compitan en ese grupo). Total staff-Delegate: 652 (vs 224 antes).
- [x] Patch en `compscript/staff/assign.js`: `AssignMisc` no pasaba `unavailable` → default a `() => []`
- [x] Patch en `run_pipeline.js`: exponer warnings de `StaffAssignmentResult` en consola
- [x] Borrar `Intención de Registro Delegados SAC 2026.xlsx` (archivo obsoleto)
- [x] Análisis de capacidad → `docs/ANALISIS_ESTACIONES.md`
- [x] Actualizar REGLAS.md, README.md, GUIDE.md, ANALISIS_ESTACIONES.md, NOTAS.md
