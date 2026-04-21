# SAC 2026 — CompScript Setup

Scripts de competencia para el **Campeonato Sudamericano WCA 2026** (Bogotá, Colombia, Junio 12-15).

## Documentación

| Archivo | Qué contiene |
|---------|-------------|
| **README.md** | Este archivo. Setup, estructura, y despliegue. |
| **TODO.md** | Tareas pendientes y preguntas por resolver. |
| **docs/REGLAS.md** | Todas las reglas de negocio (R1-R58) con estado de implementación. |
| **docs/GUIDE.md** | Desglose técnico de cada script, algoritmos, y comparación con US Nats 2025. |
| **docs/ANALISIS_ESTACIONES.md** | Análisis de capacidad: por qué 10+3+3 es el óptimo para la cantidad de staff. |

---

## Quick Start

```bash
# 1. Descargar WCIF actualizado de la WCA
make fetch-wcif

# 2. Correr pipeline completo (import → grupos → staff)
make pipeline

# 3. Ver resultados
make serve     # CompScript UI → http://localhost:3030/SAC2026
make viewer    # Competitor-groups → http://localhost:5173/competitions/SAC2026

# Otros comandos
make reports   # Exportar reportes HTML → output/index.html
make clean     # Resetear WCIF a estado limpio
make extract   # Re-extraer datos de voluntarios desde Excel (raro)
make help      # Ver todos los comandos
```

---

## Estructura del Proyecto

```
sac2026/
├── lib/                        # Constantes y definiciones compartidas
│   ├── _constants.cs           # Nombres de propiedades (VOLUNTEER, STAGE_LEAD, etc.)
│   ├── _rooms.cs               # Constantes de salas + AllRooms()
│   ├── _group_counts.cs        # Grupos por sala por evento
│   └── _assigned_room.cs       # Mapeo Equipo→Sala por día (rotación)
│
├── prep/                       # Preparación de datos (Fase 1 del pipeline)
│   ├── import.cs               # Importar ~97 staff (37 delegados + ~60 voluntarios)
│   ├── add_missing_staff.cs    # Personas sin WCA ID (Angie Casallas)
│   ├── overrides.cs            # Ajustes manuales: remover/promover delegados, exclusiones
│   ├── populate_r1.cs          # Crear resultados vacíos de R1
│   ├── create_groups.cs        # Crear 219 actividades de grupo en el schedule
│   └── volunteer_teams.cs      # Cluster: dividir staff en 4 equipos balanceados
│
├── groups/                     # Asignación de competidores a grupos
│   ├── lib/
│   │   ├── _assignment_sets.cs # Sets de asignación (stage-leads → volunteers → competitors)
│   │   ├── _scorers.cs         # Scorers: diversidad de país, conflictos, StaffRoomScorers
│   │   └── _midcomp.cs         # Helper para rondas 2+ (midcomp)
│   ├── r1/                     # Ronda 1 (16 eventos): 777, 666, minx, sq1, clock, 555,
│   │                             444, skewb, 333, 333bf, 333oh, 222, pyram, 555bf, 444bf, 333mbf
│   └── midcomp/                # Rondas 2+ (22 scripts) — se corren en vivo durante competencia
│
├── volunteers/                 # Asignación de staff (Fase 3 del pipeline)
│   ├── lib/
│   │   ├── _jobs.cs            # Definiciones de roles (referencia, no usado en pipeline)
│   │   ├── _assign.cs          # Helper de asignación (referencia, no usado en pipeline)
│   │   └── _scorers.cs         # Scorers de staff (referencia, no usado en pipeline)
│   ├── day1.cs                 # Jun 12: 7x7, 6x6, Mega, Sq1, Clock, 5x5 + R2s
│   ├── day2.cs                 # Jun 13: Clock R2, 4x4, Skewb, 3x3, 5BLD, MBLD
│   ├── day3.cs                 # Jun 14: 3BLD, 4x4 R2, OH, 2x2, Pyram, 4BLD, MBLD, 3x3 R2
│   └── day4.cs                 # Jun 15: Semis + Finales
│
├── docs/                       # Documentación de referencia
│   ├── REGLAS.md               # Reglas de negocio (R1-R58) y estado de implementación
│   ├── GUIDE.md                # Guía técnica: algoritmos, comparación US Nats 2025
│   └── ANALISIS_ESTACIONES.md  # Análisis de capacidad y número óptimo de estaciones
│
├── reports/                    # Reportes (se exportan con `make reports`)
│   ├── team_roster.cs          # Miembros por equipo con roles
│   ├── list_of_people.cs       # Lista completa para badges
│   ├── staff_summary.cs        # Conteos de staff por rango/país
│   ├── volunteer_workload.cs   # Carga de trabajo por voluntario
│   ├── team_assignments.cs     # Sala asignada por equipo por día
│   ├── stage_lead_groups.cs    # En qué grupo compite cada delegado
│   ├── personal_schedules.cs   # Schedule completo por staff member
│   ├── country_breakdown.cs    # Competidores y staff por país
│   ├── group_schedule_overview.cs # Cronograma de grupos
│   ├── event_stats.cs          # Registros por evento + psych sheet
│   └── pending_staff.cs        # Personas pendientes de registro
│
├── data/                       # Datos de entrada
│   ├── extract_volunteers.py   # Extrae datos de Excel → volunteers.json (one-time)
│   ├── generate_import.py      # Genera volunteer_properties.cs desde JSON (one-time)
│   ├── volunteers.json         # Datos procesados de voluntarios
│   ├── volunteer_properties.cs # Propiedades generadas (incluido por import.cs)
│   ├── score_takers.txt        # Lista de score takers (pendiente implementar)
│   └── scramble_report.txt     # Reporte de mezclas
│
├── output/                     # Reportes HTML generados (make reports)
├── run_pipeline.js             # Runner del pipeline (3 fases)
├── export_reports.js           # Exportador de reportes a HTML
├── Makefile                    # Comandos de build
│
├── REGLAS.md            # Reglas de negocio
├── GUIDE.md                    # Guía técnica
├── ANALISIS_ESTACIONES.md      # Análisis de capacidad
└── TODO.md                     # Pendientes
```

---

## Pipeline (3 fases)

```
Fase 1 — Import + Equipos
  import.cs → add_missing_staff.cs → overrides.cs → populate_r1.cs → create_groups.cs → volunteer_teams.cs
  ↳ Resultado: 500 personas con propiedades, 219 grupos, 4 equipos de ~24

Fase 2 — Asignación de Grupos
  groups/r1/*.cs (16 eventos)
  ↳ Staff forzado a competir en la zona de su equipo (StaffRoomScorers, 100% cumplimiento)
  ↳ Resultado: 4,116 asignaciones de competidor

Fase 3 — Asignación de Staff
  volunteers/day1-4.cs
  ↳ Equipo primario tiene prioridad (+500). Flotante refuerza si falta gente.
  ↳ Resultado: ~3,600 asignaciones de staff (juez, scrambler, runner, delegado)
```

Las 3 fases son necesarias porque `Cluster()` bloquea expresiones subsiguientes en el runner Node.js, y la Fase 2 necesita `staff-team` de la Fase 1 para los scorers de sala.

---

## Sistema de Equipos

4 equipos rotan diariamente. 3 cubren las zonas principales, 1 es flotante.

| Día | Amarilla | Azul | Roja | Flotante (BLD + No oficiales + Apoyo) |
|-----|----------|------|------|---------------------------------------|
| Jun 12 | T1 | T2 | T3 | **T4** — Mirror Blocks R1 |
| Jun 13 | T2 | T3 | T4 | **T1** — 5BLD + MBLD a1 + Kilominx R1 |
| Jun 14 | T3 | T4 | T1 | **T2** — MBLD a2 + 4BLD + Team BLD + FTO + finals |
| Jun 15 | T4 | T1 | T2 | **T3** — FTO Final + Team BLD Final |

**Reglas clave:**
- Staff siempre compite en la zona de su equipo (R58)
- El equipo flotante refuerza las zonas principales solo cuando falta gente
- El solver siempre prefiere al equipo de la zona (+500 puntos) sobre el flotante
- En la práctica, 99%+ de las asignaciones son del equipo primario

---

## Staff por Grupo (zonas principales)

| Rol | Cantidad | Quién |
|-----|----------|-------|
| Juez | 10 | Voluntarios + delegados Jr/Trainee (no team leads) |
| Scrambler | 3 | Voluntarios + delegados Jr/Trainee |
| Runner | 3 | Voluntarios + delegados Jr/Trainee |
| Delegado supervisor | 1 | Cualquier delegado |
| **Total** | **17** | |

Ver `ANALISIS_ESTACIONES.md` para la justificación de estos números.

---

## Despliegue en Producción (WCA real)

### Requisitos previos

1. **Credenciales OAuth**: Registrar una aplicación en https://www.worldcubeassociation.org/oauth/applications
   - Scope: `public manage_competitions`
   - Redirect URI: `http://localhost:3030/auth/callback`

2. **Archivo `.env.PROD`** en la carpeta `compscript/`:
   ```
   NODE_ENV=production
   SCHEME='http'
   HOST='localhost'
   PORT=3030
   WCA_HOST='https://www.worldcubeassociation.org'
   API_KEY='tu-oauth-app-id'
   API_SECRET='tu-oauth-app-secret'
   COOKIE_SECRET='un-string-random-seguro'
   SCRIPT_BASE='../scc-scripts/2026-sac'
   ```

3. **Permisos**: Debes ser delegado u organizador de SAC2026 en la WCA.

### Opción A: Pipeline automático (recomendado para primera vez)

```bash
# Corre todo de una vez contra la WCA real
cd scc-scripts/2026-sac
ENV=PROD make pipeline
```

Esto ejecuta las 3 fases y guarda el WCIF en `.wcif_cache/PROD/SAC2026`. Luego necesitas hacer push manual desde la UI.

### Opción B: Script por script desde la UI (recomendado para ajustes)

```bash
# Iniciar compscript en modo producción
cd compscript && ENV=PROD npm start
```

1. Abrir http://localhost:3030 → Login con WCA OAuth
2. Navegar a http://localhost:3030/SAC2026
3. Ejecutar scripts **uno por uno** en este orden:

| # | Script | Dry Run? | Qué verificar |
|---|--------|----------|---------------|
| 1 | `prep/import.cs` | Sí | 8 team leads + 29 delegados + ~60 voluntarios |
| 2 | `prep/add_missing_staff.cs` | Sí | Angie Casallas como voluntaria |
| 3 | `prep/overrides.cs` | Sí | 5 delegados removidos, 4 promovidos, 8 bajados |
| 4 | `prep/populate_r1.cs` | Sí | "Added N results" por evento |
| 5 | `prep/create_groups.cs` | **No** | **NO es idempotente** — correr 2 veces crea duplicados |
| 6 | `prep/volunteer_teams.cs` | Sí→No | 4 equipos de ~24, 2 leads cada uno |
| 7-22 | `groups/r1/*.cs` (16 archivos) | Sí→No | Grupos balanceados, staff en zona correcta |
| 23-26 | `volunteers/day1-4.cs` | Sí→No | Staff asignado, 0 grupos sin supervisor |

4. Verificar en https://competitiongroups.com/competitions/SAC2026

### Notas de seguridad

- **Siempre hacer Dry Run primero** para verificar output antes de guardar
- `create_groups.cs` **NO es idempotente** — si falla o se corre doble, usar "Clear Cache" para resetear
- Los staff assignments usan `overwrite=true` — re-correr es seguro
- `Cluster()` es no-determinista — los equipos pueden cambiar entre corridas
- Para midcomp (R2+), correr `groups/midcomp/*.cs` en vivo conforme haya resultados

---

## Personalización

### Cambiar roles de personas

Editar `prep/overrides.cs`:

```compscript
# Quitar de team lead (queda como delegado regular):
DeleteProperty([WCA_ID], TEAM_LEAD)

# Quitar del staff completamente:
DeleteProperty([WCA_ID], VOLUNTEER)
DeleteProperty([WCA_ID], STAGE_LEAD)
DeleteProperty([WCA_ID], TEAM_LEAD)

# Promover a team lead:
SetProperty([WCA_ID], TEAM_LEAD, true)

# Forzar a un equipo específico:
SetProperty([WCA_ID], STAFF_TEAM, 2)
```

Después: `make pipeline` para regenerar todo.

### Agregar persona sin WCA ID

En `prep/add_missing_staff.cs`:
```compscript
SetProperty([pUSER_ID], VOLUNTEER, true)  # p + wcaUserId
```

### Regenerar reportes

```bash
make reports   # Exporta 11 reportes a output/*.html
open output/index.html
```

---

## Entorno de Desarrollo

CompScript tiene dos configuraciones locales:
- `SKIP_AUTH=true` en `.env.DEV` — no necesita OAuth
- Endpoints `/competitions/:id` en `main.js` — sirve WCIF para el viewer de Competitor-groups

```bash
# Terminal 1: Pipeline
make fetch-wcif && make pipeline

# Terminal 2: Servidor CompScript
make serve     # http://localhost:3030/SAC2026

# Terminal 3: Viewer
make viewer    # http://localhost:5173/competitions/SAC2026
```
