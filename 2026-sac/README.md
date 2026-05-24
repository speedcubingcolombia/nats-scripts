# SAC 2026 — CompScript Setup

Competition scripts for the **WCA South American Championship 2026** (Bogota, Colombia, June 12-15).

---

## How to use this repository

### Requirements

- **Node.js** (for compscript)
- **Python 3.13+** with **uv** (for data scripts)
- The **compscript** engine at `../../compscript/`

### Local development (first time)

```bash
cd scc-scripts/2026-sac

# 1. Install Python dependencies (from scc-scripts/)
cd .. && uv sync && cd 2026-sac

# 2. Download updated WCIF from WCA
make fetch-wcif

# 3. Run full pipeline (import → groups → staff)
make pipeline

# 4. View results
make serve     # CompScript UI → http://localhost:3030/SAC2026
make viewer    # Competitor-groups → http://localhost:5173/competitions/SAC2026
make reports   # HTML Reports → reports/html/index.html
```

### Available commands

| Command | What it does |
|---------|--------------|
| **Development** | |
| `make pipeline` | Runs all 3 phases + Phase 2.5 locally |
| `make fetch-wcif` | Downloads a fresh WCIF from the WCA public API |
| `make serve` | Starts CompScript dev server (port 3030, no auth) |
| `make viewer` | Starts Competitor-groups viewer (port 5173) |
| `make reports` | Generates 5 HTML reports in `reports/html/` |
| `make clean` | Resets local WCIF cache (clear groups/assignments) |
| `make extract` | Re-extracts volunteer data from Excel |
| **Production** | |
| `make deploy` | Full pipeline + deploy to WCA (opens browser for OAuth) |
| `make deploy-restore` | Restore backup + deploy (full reset) |
| `make backup` | Download current live WCIF as backup |
| `make verify` | Verify deployed WCIF (zone compliance, TLs, etc.) |
| `make serve-prod` | Start CompScript server in PROD mode (OAuth) |
| `make help` | Shows all available commands |

---

## Making common changes

### Add/remove a person from staff

Edit `prep/overrides.cs`:

```compscript
# Remove from staff entirely (no judge/scramble/run):
DeleteProperty([WCA_ID], VOLUNTEER)
DeleteProperty([WCA_ID], LISTED_DELEGATE)

# Promote to Team Lead:
SetProperty([WCA_ID], TEAM_LEAD, true)

# Remove from Team Lead (stays as regular delegate):
DeleteProperty([WCA_ID], TEAM_LEAD)
```

Then: `make pipeline` to regenerate.

### Add a person without WCA registration (AddPerson)

In `prep/add_missing_staff.cs`:
```compscript
AddPerson(WCA_USER_ID, "Nombre Completo")
SetProperty([pWCA_USER_ID], VOLUNTEER, true)
```

The `WCA_USER_ID` can be found by searching for the person at https://www.worldcubeassociation.org/api/v0/search/users?q=nombre

### Change the number of stations

In `volunteers/day*.cs` and `volunteers/unofficial.cs`, change the number in each `Job("judge", N, ...)`.
Currently: 14 judges (main rooms), 8 judges (BLD), 8 judges (unofficial finals).
Flexible minimums are hardcoded in `compscript/staff/assign.js` by job name.
BLD scramblers require `can-scramble-444`/`can-scramble-555` in their eligibility filters.

### Regenerate volunteer data (rare)

Only needed if the source xlsx files change:
```bash
cd .. && uv run 2026-sac/data/extract_volunteers.py
uv run 2026-sac/data/generate_import.py
```

---

## Production Deployment (real WCA)

### Prerequisites

1. **OAuth App** registered at https://www.worldcubeassociation.org/oauth/applications
   - Scope: `public manage_competitions`
   - Redirect URI: `http://localhost:3030/auth/callback`

2. **`.env.PROD`** in the `compscript/` folder:
   ```
   NODE_ENV=production
   SCHEME='http'
   HOST='localhost'
   PORT=3030
   WCA_HOST='https://www.worldcubeassociation.org'
   API_KEY='your-oauth-app-id'
   API_SECRET='your-oauth-app-secret'
   COOKIE_SECRET='a-random-secure-string'
   SCRIPT_BASE='../scc-scripts/2026-sac'
   ```

3. **Permissions**: Must be a delegate or organizer of SAC2026 on the WCA.

### Option A: Automated pipeline (first time or full reset)

```bash
cd scc-scripts/2026-sac
ENV=PROD make pipeline
```

Runs all 3 phases. The WCIF is stored in `.wcif_cache/PROD/SAC2026`.
Then do a **manual push** from the compscript server UI.

### Option B: From the UI (incremental adjustments)

```bash
cd ../../compscript && ENV=PROD npm start
```

1. Open http://localhost:3030 → Login with WCA OAuth
2. Navigate to http://localhost:3030/SAC2026
3. Run scripts one by one:

| Step | Script | Dry Run? | Verify |
|------|--------|:--------:|--------|
| 1 | `prep/import.cs` | Yes | ~108 staff in pool |
| 2 | `prep/add_missing_staff.cs` | Yes | 15 people via AddPerson |
| 3 | `prep/overrides.cs` | Yes | Exclusions correct |
| 4 | `prep/populate_r1.cs` | Yes | "Added N results" |
| 5 | `prep/create_groups.cs` | **No** | Warning: NOT idempotent — do not run twice |
| 6 | `prep/volunteer_teams.cs` | Yes→No | 4 teams, 3 TLs each |
| 7-22 | `groups/r1/*.cs` | Yes→No | Balanced groups |
| 23-26 | `volunteers/day1-4.cs` | Yes→No | Staff assigned |
| 27 | `volunteers/unofficial.cs` | Yes→No | Unofficial events |

4. Verify at https://competitiongroups.com/competitions/SAC2026
5. **Push** from the UI: "Save to WCA" button

### Production changes (post-deploy)

To make changes after the initial deploy:

```bash
# 1. Make changes to scripts (overrides, day scripts, etc.)
# 2. Re-run only the affected phases:

# If you changed staff/teams:
ENV=PROD make pipeline    # regenerates everything

# If you only changed staff assignments (day scripts):
# Run from UI: volunteers/day1-4.cs with overwrite=true

# If you need to redo groups (CAUTION):
# First: "Clear Cache" in the UI to delete existing groups
# Then: run create_groups.cs + groups/r1/*.cs again
```

### Midcomp (during the competition)

For round 2+ (when results are available):
```bash
# From the UI, run the round script:
groups/midcomp/333-r2.cs
groups/midcomp/222-r2.cs
# etc.
```

### Safety and precautions

- Warning: **Always Dry Run first** — verify output before saving
- Warning: `create_groups.cs` **is NOT idempotent** — running it twice creates duplicates. Use "Clear Cache" if it fails.
- Staff assignments (`overwrite=true`) are safe to re-run
- Group assignments are idempotent (skipped if already assigned)
- Warning: `Cluster()` may produce different results between runs (non-deterministic)

---

## Project structure

```
2026-sac/
├── lib/                        # Shared constants and definitions
│   ├── _constants.cs           # VOLUNTEER, LISTED_DELEGATE, TEAM_LEAD, etc.
│   ├── _rooms.cs               # Zona Amarilla/Azul/Roja
│   ├── _group_counts.cs        # Groups per room per event
│   └── _assigned_room.cs       # Rotation: Team → Room per day
│
├── prep/                       # Phase 1: Data preparation
│   ├── import.cs               # Import staff (~99 in pool)
│   ├── add_missing_staff.cs    # Non-registered staff via AddPerson
│   ├── overrides.cs            # Exclusions and manual adjustments
│   ├── populate_r1.cs          # Create empty R1 results
│   ├── create_groups.cs        # Create groups in schedule (NOT run in pipeline)
│   └── volunteer_teams.cs      # Cluster: 4 balanced teams
│
├── groups/                     # Phase 2: Competitor assignment
│   ├── lib/                    # Helpers (scorers, assignment sets)
│   ├── r1/                     # 16 R1 events
│   └── midcomp/                # Round 2+ (live)
│
├── volunteers/                 # Phase 3: Staff assignment
│   ├── day1-4.cs               # Staff per day (14j + 3s + 3r + TL-Delegate)
│   ├── unofficial.cs           # Unofficial events (8j + 2s + 2r + 1 Lead)
│   └── lib/                    # Reference definitions (not used in pipeline)
│
├── data/                       # Data
│   ├── sources/                # Source .xlsx files (gitignored, personal data)
│   ├── outputs/                # Generated by Python (gitignored)
│   ├── extract_volunteers.py   # Excel → outputs/volunteers.json
│   ├── generate_import.py      # JSON → volunteer_properties.cs
│   └── volunteer_properties.cs # Volunteer properties (used in pipeline)
│
├── reports/                    # Reports
│   ├── html/                   # Generated HTML (make reports, gitignored)
│   └── *.cs                    # CompScript for each report
│
├── docs/                       # Documentation
│   ├── RULES.md                # Constraints and rules
│   ├── PEOPLE.md               # People: TLs, excluded, roles
│   ├── EXPLANATION.md          # Technical explanation of CompScript
│   └── STATION_ANALYSIS.md     # Capacity analysis
│
├── run_pipeline.js             # Pipeline runner (3 phases + 2.5)
├── export_reports.js           # Report exporter to HTML
├── Makefile                    # Build commands
└── TODO.md                     # Pending tasks
```

---

## Pipeline (3 phases + 1 intermediate)

```
Phase 0.5 — Scramble Quality (JS in run_pipeline.js)
  Computes scramble-quality-{event} (0-3) from WCIF personalBests.
  Used by Cluster for team balance and AssignStaff for scrambler priority.

Phase 1 — Import + Teams
  import.cs → add_missing_staff.cs → volunteer_properties.cs →
  overrides.cs → populate_r1.cs → volunteer_teams.cs
  → 510 people, 222 groups, 4 teams (25/25/25/24)
  NOTE: create_groups.cs NOT run in pipeline (groups come from WCIF)

Phase 2 — Group Assignment (16 R1 events)
  groups/r1/*.cs
  → Staff forced to compete in their team's zone (-5000 wrong room)
  → Float team pushed to first/last groups (free for unofficial/BLD)
  → BLD competitors pushed to non-conflicting groups
  → ManuallyAssign for TLs + overwrite=true on AssignGroups
  → ~4,083 competitor assignments

Phase 2.5 — Cohesion Tagging (JS in run_pipeline.js)
  Sets compete-d{N}-{room} properties per person.
  → Used by Phase 3 for +100 cohesion bonus

Phase 3 — Staff Assignment
  volunteers/day1-4.cs (BLD first) + unofficial.cs (last)
  → Primary team +500, cohesion +100, float deprioritized -300
  → Delegate = TLs only (main team for principals, float for BLD)
  → BLD scramblers filtered by can-scramble-{puzzle} + quality scorer
  → ~4,863 staff assignments
```

---

## Key numbers

| Concept | Value |
|---------|-------|
| Competitors | ~493 |
| Staff in pool | 99 (T1=25, T2=25, T3=25, T4=24) |
| Outside the pool | ~17 (organizers, streaming, score takers, coordinators, etc.) |
| Team Leads | 12 (3/team: 1 BR + 1 CO + 1 other) |
| Score Takers | 4 (Laís, Francia, Adriana, Valentina) |
| Streaming | 3 (Luigi, Klaus, Ricardo) |
| Groups | 222 |
| Total assignments | ~8,946 |
| Main room stations | 14 judges + 3 scr + 3 run + TL-Delegate = ~23/group |
| BLD stations | 8 judges + 2 scr + 2 run + TL-Delegate (float team only) |
| Unofficial finals | 8 judges + 2 scr + 2 run + 1 Lead = 13/event |
| Unofficial R1 | Ad-hoc (schedule overlaps prevent automated assignment) |
| Zones | 3 main (Amarilla/Azul/Roja) + Morada (BLD) + Verde (unofficial) |
