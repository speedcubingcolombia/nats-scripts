# SAC 2026 — Restricciones

Documento de referencia con todas las restricciones definidas para la asignación de grupos, staff y equipos. Cada restricción está en lenguaje natural para facilitar su traducción a CompScript.

---

## Equipos de Staff

### Estructura

- R1: Hay **4 equipos de staff** de sala (25/25/25/24 = 99 personas).
- R2: Cada equipo tiene **2 team leads** (delegados confirmados como líderes). Los team leads pueden competir y cubrirse entre ellos. El LimitConstraint en `volunteer_teams.cs` fija exactamente 2 por equipo (8 total); si se necesitan 3 por equipo hay que subirlo a `LimitConstraint("Team Leads", ..., 3, 3)`.
- R3: Cada equipo tiene delegados Jr/Trainee que trabajan como staff regular (jueces, scramblers, runners).
- R4: Cada equipo tiene voluntarios no-delegados.
- Total staff aprobado: **104** (fuente: `SAC2026-registration.xlsx`, columna Cargo ∈ {Voluntario, Delegado, Organizador, Lider, Streaming}, filtrado por Status='a' + Registration Status='accepted'). De esos, 5 quedan fuera del pool de staff por override (Guido Dipietro, Enrymar Cisneros, Klaus Ramos, Luigi Segura, Diego Casas, Eduard García → 6 en total), dejando 99 en teams.

### Zonas

Hay **5 zonas** de competencia:

| Zona | Sala | Tipo |
|------|------|------|
| Zona Amarilla | Coliseo | Principal (oficial) |
| Zona Azul | Coliseo | Principal (oficial) |
| Zona Roja | Coliseo | Principal (oficial) |
| Zona Morada (BLD) | Sala BLD | Eventos a ciegas |
| Zona Verde (TARIMA) | Tarima | Eventos no oficiales |

### Asignación a salas

- R5: Cada día, **3 equipos** cubren las zonas principales (Amarilla, Azul, Roja) — uno por sala, todo el equipo junto.
- R6: Cada día, **1 equipo** es flotante: cubre **BLD + No oficiales + Apoyo** a las salas principales en tiempos muertos.
- R7: Los 4 equipos **rotan** cada día. Cada equipo es flotante exactamente **1 día** de los 4.
- R8: Cuando el equipo flotante no tiene tareas de BLD ni no oficiales, apoya la sala principal que más lo necesite.
- R9: Ningún equipo está fijo — todos experimentan las 3 salas principales y el rol flotante.

### Rotación

| Día | Amarilla | Azul | Roja | Flotante (BLD + No oficiales + Apoyo) |
|-----|----------|------|------|---------------------------------------|
| Jun 12 | Equipo 1 | Equipo 2 | Equipo 3 | **Equipo 4** — No oficiales (Mirror R1) + apoyo |
| Jun 13 | Equipo 2 | Equipo 3 | Equipo 4 | **Equipo 1** — BLD (5BLD, MBLD a1) + No oficiales (Kilominx R1) |
| Jun 14 | Equipo 3 | Equipo 4 | Equipo 1 | **Equipo 2** — BLD (MBLD a2, 4BLD) + No oficiales (Team BLD, FTO, Finals) |
| Jun 15 | Equipo 4 | Equipo 1 | Equipo 2 | **Equipo 3** — No oficiales (FTO Final, Team BLD Final) + apoyo |

---

## Estaciones y Personal por Grupo

### Salas principales (Amarilla, Azul, Roja)

- R10: **10 estaciones** (jueces) por zona por grupo. Análisis de capacidad con 3s+3r muestra que 10 es el máximo con 0 grupos sin cubrir (margen +0 en peor caso). 9 estaciones da margen +1.
- R11: **3 scramblers** por zona por grupo.
- R12: **3 runners** por zona por grupo.
- R13: **1 delegado supervisor** por zona por grupo. Siempre debe haber al menos 1. Cualquier delegado (incluido Jr/Trainee) puede supervisar.
- R14: Total por grupo por sala: **17 staff** (10+3+3+1).

### Sala BLD (Zona Morada) y No oficiales (Zona Verde)

- R15: **4 jueces** por grupo en BLD (eventos más pequeños).
- R16: **2 delegados supervisores** por grupo en BLD.
- R54: Eventos no oficiales: staff según necesidad del evento (cubierto por equipo flotante del día).

---

## Roles y Elegibilidad

### Quién puede hacer qué

- R17: **Solo el staff** (voluntarios + delegados) recibe tareas de juez, scrambler, runner o delegado. Los competidores regulares **nunca** reciben tareas de staff.
- R18: Los **team leads** (Full/Senior) **solo supervisan** (rol "Delegate"). Nunca juzgan, mezclan ni corren.
- R19: Los **delegados Jr/Trainee** trabajan como staff regular: juzgan, mezclan, corren. También pueden supervisar si no hay team leads disponibles.
- R20: Los **voluntarios** (no delegados) juzgan, mezclan y corren. No supervisan.
- R21: Los **team leads siempre son delegados**. No puede haber un team lead que no sea delegado.

### Supervisión

- R22: Todo grupo debe tener **al menos 1 delegado supervisor** asignado que NO esté compitiendo en ese grupo.
- R23: Los supervisores (Delegate) pueden venir de **cualquier equipo** — los delegados supervisan el torneo, no solo su sala.
- R24: Las tareas de juez, scrambler y runner **sí** están restringidas al equipo de la sala.

---

## Restricciones de Conflicto y Descanso

- R25: **Nunca** se asigna a alguien a staffear un grupo donde ya está compitiendo.
- R26: Se **penaliza** asignar a alguien al grupo inmediatamente después de competir (FollowingGroupScorer: -50).
- R27: Se **penaliza** asignar a personas que ya han trabajado mucho (JobCountScorer: -5 por cada trabajo previo).
- R28: Para juez/scrambler/runner, el staff solo trabaja en la sala de su equipo. Para supervisión (Delegate), cualquier delegado libre puede supervisar cualquier sala.
- R58: **El staff siempre compite en la zona donde está haciendo staff**, a menos que su equipo sea flotante ese día. Implementado con StaffRoomScorers (-5000 penalty) en cada evento R1. Cumplimiento verificado: **100%** (678 correctas, 0 incorrectas, 225 flotantes).
- R59: **Prioridad del equipo primario**: cada `AssignStaff` usa `PersonPropertyScorer((NumberProperty("staff-team") == N), 500)` donde N es el team primario de esa sala ese día. Resultado: el team primario siempre cubre su sala asignada, aunque el miembro no compita ese día. El team flotante complementa solo si el primario se satura.
- R60: **Cohesión de zona al staffear**: cada `AssignStaff` usa `PersonPropertyScorer(BooleanProperty("compete-d{N}-{slug}"), 100)` (un bonus secundario de +100). Esto hace que, dentro del team primario, los que compiten en esa sala ese día llenen primero (menos cruce entre salas para el propio competidor). La propiedad `compete-d{N}-{slug}` se setea automáticamente en la Fase 2.5 de `run_pipeline.js` tras la asignación de grupos de competidores.

---

## Personas Específicas

- R29: **Luigi Segura** (2018MELO07) → Equipo de streaming. Sin tareas de staff.
- R30: **Klaus Ramos** (2016RAMO01) → Equipo de streaming. Sin tareas de staff.
- R31: **Guido Dipietro** (2013DIPI01) → Sin ninguna tarea asignada. Es delegado confirmado pero no tiene rol operativo.
- R32: **Enrymar Cisneros** (2013CISN01) → Sin ninguna tarea asignada. Es delegada confirmada pero no tiene rol operativo.
- R32b: **Diego Alejandro Casas Jimenez** (2014JIME05, Organizador) → Fuera del pool de staff. Tiene rol organizativo pero no trabaja turnos de zona.
- R32c: **Eduard Esteban García Domínguez** (2011EDUA01, Organizador) → Fuera del pool de staff. Tiene rol organizativo pero no trabaja turnos de zona.
- R32d: **Catalina Herrera López** (2017LOPE31, Organizador) → Sigue en el pool (a diferencia de Diego y Eduard). Si también debe quedar fuera, agregar `DeleteProperty([2017LOPE31], VOLUNTEER)` en `overrides.cs`.

### Delegados y voluntarios removidos del staff (solo compiten)

- R55: Los siguientes NO participan como staff — no tienen Cargo en `SAC2026-registration.xlsx` y quedaron fuera de `import.cs`:
  - **Brian Hambeck** (2016HAMB02, UY) — era Trainee; ahora solo compite.
  - **Gabriel Sargeiro Gomes de Mello** (2014MELL03, BR) — ya no está en el WCIF.
  - **Israel Fraga da Silva** (2012SILV22, BR) — era Junior; ahora solo compite.
  - **Kalani Oliveira** (2018OLIV28, BR) — era Full; ahora solo compite.
  - **Mateo Aguirre** (2022AGUI03, PE) — era Trainee; ahora solo compite.
  - **Antonio Gerardo de Castro Costa Filho** (2023FILH05, BR) — aparece con Cargo=None en la hoja de registro, solo compite.
  - **Voluntarios no aprobados**: 2012PERE04, 2015TORR12, 2018GONZ25, 2019CAMP10, 2022PINE05.

  **Nota**: Dennis Rosero (2010ROSE03, CO) — en versiones anteriores estaba listado aquí. Actualmente vuelve a ser **Voluntario** (aparece con Cargo=Voluntario en la lista definitiva y se mantiene en el pool).

### Delegados por agregar (pendiente registro)

- R56: Delegados confirmados pendientes de registro:
  - ~~**Felipe Andres Rojas Garces** (CL, 2009GARC02)~~ — aparece con Status='b' (rechazado) en SAC2026-registration. No entra como staff.
  - ~~Antonio Gerardo de Castro costa filho (BR)~~ — registrado pero sin Cargo de staff.

### Voluntarios especiales

- R57: **Angie Casallas** (wcaUserId=520057, sin WCA ID) — competidora + voluntaria. Definida en add_missing_staff.cs.

---

## Asignación de Grupos de Competidores

- R33: Todos los grupos de un evento tienen ±1 persona de diferencia en tamaño.
- R34: Los team leads se distribuyen primero (prioridad 1) para garantizar supervisión en cada grupo.
- R35: Los voluntarios/delegados staff se distribuyen segundo (prioridad 2) para asegurar staff en cada grupo.
- R36: Los competidores regulares se distribuyen último (prioridad 3).
- R37: Se busca diversidad de países: máximo 2 del mismo país por grupo (+3 puntos), penalización por exceso (-1).
- R38: Competidores que participan en el evento siguiente deben quedar en grupos tempranos (-100 penalización a grupos tardíos).
- R39: Se prefieren grupos impares para los tiers pequeños (staff), evitando concentrarlos en grupos consecutivos.

---

## Clustering de Equipos

- R40: Tamaño de equipo: **22-32 personas** (actual: 24-25).
- R41: Team leads: **exactamente 2 por equipo** (8 total) según el `LimitConstraint("Team Leads", BooleanProperty(TEAM_LEAD), 2, 2)` en `volunteer_teams.cs`. Objetivo inicial era 3 por equipo (12 total) pero solo hay 8 confirmados. Subir a `3, 3` cuando se confirmen los 4 restantes.
- R42: Delegados distribuidos equitativamente entre equipos.
- R43: Número de eventos registrados balanceado por equipo.
- R44: Colombianos y brasileños repartidos equitativamente.
- R45: Competidores de BLD repartidos equitativamente.

---

## Team Leads (12 total = 3 × 4 equipos)

### Confirmados (3)

| # | Nombre | WCA ID | País | Notas |
|---|--------|--------|------|-------|
| 1 | Ronny Morocho | 2018MORO01 | EC | |
| 2 | Manuel Popayán | 2017POPA01 | CO | |
| 3 | **"Coto"** | ? | ? | **PENDIENTE: ¿quién es?** |

### Recomendados por Diego Casas (hasta 8)

| # | Nombre | WCA ID | País | Estado actual |
|---|--------|--------|------|---------------|
| 4 | Haiver Reyes Garcia | 2017GARC48 | CO | Jr/Trainee → promover |
| 5 | Joel Hernández | 2007HERN02 | SV | Ya es TEAM LEAD |
| 6 | **"Daniel de Querétaro"** | ? | MX | **PENDIENTE: ¿Daniel Castellanos Cruz (2014CRUZ06)?** No es delegado confirmado. |
| 7 | Pedro Miranda Moreira | 2014MORE05 | BR | Ya es TEAM LEAD |
| 8 | João Vinícius Santos | 2016SANT66 | BR | Ya es TEAM LEAD |
| 9 | Cristian Vega | 2013VEGA03 | AR | Ya es TEAM LEAD |
| 10 | Rocío Rodríguez Rivera | 2016RIVE14 | MX | Jr/Trainee → promover |

### Pendiente decidir (necesitamos 12 total, tenemos ~10 claros)

Team leads actuales NO mencionados en las listas anteriores — decidir si se quedan o bajan a Jr/Trainee:

| Nombre | WCA ID | País |
|--------|--------|------|
| Alexandre Ondet | 2017ONDE01 | FR |
| Andrés Suzuki Cabrera | 2016SUZU03 | PE |
| Elias Acosta | 2016ACOS08 | PY |
| Jhonatan Reategui | 2016REAT01 | PE |
| Lucas Ichiro Yunomae | 2014YUNO01 | BR |
| Marlon de V. Marques | 2014MARQ02 | BR |
| Rafael Sanchez | 2014SANC19 | VE |
| Sergio Guillen Ibarra | 2014IBAR01 | CO |

---

## Score Takers (Pendiente de implementar)

- R46: Crear un **equipo separado de score takers** (4-5 personas).
- R47: Los score takers son **100% dedicados** a data entry. No juzgan, no mezclan, no corren.
- R48: Los score takers deben ser personas con alta preferencia de data entry y bajo interés en otras tareas.
- R49: Deben estar en un lugar aparte (mesa de data entry).

---

## Eventos No Oficiales

- R50: Los eventos no oficiales se realizan en **Zona Verde (TARIMA)**.
- R51: El **equipo 4** cubre los eventos no oficiales (parte del equipo flotante).
- R52: Eventos: Mirror Blocks, Kilominx, FTO, Team Blind 3x3.
- R53: El equipo 4 se divide según horario: parte en BLD, parte en no oficiales, según qué eventos estén activos.

---

## Estado de Implementación

| # | Restricción | Implementada | Notas |
|---|-------------|-------------|-------|
| R1-R4 | 4 equipos de staff | Si | 99 staff en 4 equipos (25/25/25/24), 2 leads c/u (objetivo 3) |
| R5-R9 | Asignación/rotación salas | Si | Rotación con flotante implementada |
| R10-R12 | 10 jueces, 3 scramblers, 3 runners | **Si** | Implementado en volunteers/day*.cs |
| R13 | 1 delegado supervisor | Si | |
| R14 | 17 staff por grupo (10+3+3+1) | **Si** | Flotante refuerza con prioridad al primario |
| R15-R16 | BLD staff | **Parcial** | 555bf y 444bf solo tienen 1 delegado (R16 pide 2) |
| R17-R21 | Roles y elegibilidad | Si | |
| R22-R24 | Supervisión | Si | 0 grupos sin supervisor |
| R25-R28 | Conflicto y descanso | Si | FollowingGroupScorer + JobCountScorer |
| R58 | Staff compite en su zona | **Si** | StaffRoomScorers, 100% cumplimiento |
| R59 | Prioridad team primario (+500) | **Si** | `PersonPropertyScorer(team==N, 500)` en cada AssignStaff |
| R60 | Cohesión de zona (+100) | **Si** | `PersonPropertyScorer(BooleanProperty("compete-d{N}-{slug}"), 100)`; propiedades generadas en Fase 2.5 de run_pipeline.js |
| R29-R32d | Personas específicas | Si | Overrides.cs — ahora incluye Diego Casas y Eduard García fuera del pool |
| R33-R39 | Grupos de competidores | Si | LP solver |
| R40-R45 | Clustering | **Parcial** | Actualmente 2 leads/equipo. Falta confirmar 4 leads más para llegar a 12 |
| R46-R49 | Score takers | **No** | Pendiente decidir equipo |
| R50-R53 | No oficiales | **No** | Pendiente definir staff |
| R55 | Removidos del staff (solo compiten) | **Si** | Lista actualizada desde SAC2026-registration.xlsx |
| R56 | Delegados por agregar | **N/A** | Felipe Rojas aparece rechazado; no pendiente |
| R57 | Angie Casallas voluntaria | **Si** | add_missing_staff.cs |
