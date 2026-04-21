# SAC 2026 — Pendientes

## Preguntas por resolver

- [ ] **¿Quién es "Coto"?** — Confirmado como team lead. ¿Jose Daniel Solano (CR)? ¿Marvin Solano (CR)? ¿Otro?
- [ ] **¿Quién es "Daniel de Querétaro"?** — Recomendado por Diego como team lead. ¿Daniel Castellanos Cruz (2014CRUZ06, MX)?
- [ ] **¿Cuáles son los 2 team leads restantes?** — Necesitamos 12 (3×4), tenemos 8. Faltan 4.
- [ ] **¿Qué pasa con los non-competing staff?** — Ana Milena Quintero, Danilo Montero, Marcela Ortiz ya no están en el WCIF.
- [ ] **¿Juliana García es staff?** — No está registrada.
- [ ] **¿Cuántos jueces/scramblers/runners por evento no oficial?** — Necesario para staffing de Zona Verde.
- [ ] **¿Quiénes serán los score takers?** — R46-R49 pendiente.
- [ ] **Decidir estaciones** — Ver `ANALISIS_ESTACIONES.md`. Opciones viables: 10+3+3, 12+3+3, o 10+4+4.

## Implementación pendiente

- [ ] **BLD: agregar 2do delegado** — `555bf-r1` y `444bf-r1` solo tienen 1 delegado. R16 pide 2.
- [ ] **Staffing de eventos no oficiales** — Zona Verde sin `AssignStaff`. Eventos: Mirror Blocks, Kilominx, FTO, Team Blind 3x3.
- [ ] **Agregar Felipe Rojas Garces (CL)** — Delegado confirmado, no registrado aún.
- [ ] **Score takers (R46-R49)** — Definir equipo de 4-5 personas.

## Personas

### Team leads confirmados (8/12)

| Equipo | Lead 1 | Lead 2 | Lead 3 (pendiente) |
|--------|--------|--------|---------------------|
| T1 | Manuel Popayán (CO) | Pedro Miranda (BR) | ? |
| T2 | Haiver Reyes (CO) | Joel Hernández (SV) | ? |
| T3 | Cristian Vega (AR) | Rocío Rodríguez (MX) | ? |
| T4 | João Vinícius (BR) | Ronny Morocho (EC) | ? |

### Delegados bajados de team lead (disponibles si se necesitan)

Alexandre Ondet (FR), Andrés Suzuki (PE), Elias Acosta (PY), Jhonatan Reategui (PE), Lucas Ichiro (BR), Marlon Marques (BR), Rafael Sanchez (VE), Sergio Guillen (CO)

### Staff pendiente de registro (PENDING en import.cs)

- 2009GARC02, 2015TRIG02 (Full Delegates)
- 2015BALD03 (Regional), 2017PERE38, 2023SILV92 (Trainees)
- 2025BELT01, 2022LIZA02, 2025MONG07, 2024SUAR10, 2015RODR37, 2025CARD14, 2025FAND01, 2025DELG07 (Volunteers)
- Felipe Rojas Garces (CL, Delegate)

## Ya resuelto

- [x] Fetch WCIF público actualizado
- [x] Remover 6 delegados no confirmados del staff
- [x] Agregar Antonio de Castro (2023FILH05) como trainee
- [x] Balancear team leads (2 por equipo)
- [x] Staff compite en su zona asignada (R58, 100%)
- [x] Pipeline de 3 fases
- [x] Equipo flotante como refuerzo con prioridad al primario
- [x] Actualizar a 10j+3s+3r
- [x] Eliminar ASIGNACIONES.md
- [x] Agregar personal_schedules.cs al export
- [x] Análisis de capacidad → `ANALISIS_ESTACIONES.md`
- [x] Actualizar REGLAS.md, README.md, GUIDE.md
