# SAC 2026 CompScript Guide

A deep breakdown of every script, how it works, and how it compares to the US Nationals 2025 setup.

---

## Table of Contents

1. [Pipeline Overview](#pipeline-overview)
2. [Step-by-Step Code Breakdown](#step-by-step-code-breakdown)
3. [Group Assignment Algorithm](#group-assignment-algorithm)
4. [Staff Assignment Algorithm](#staff-assignment-algorithm)
5. [Team Clustering](#team-clustering)
6. [Comparison with 2025 US Nationals](#comparison-with-2025-us-nationals)
7. [Staff Rotation, Rest, and Scramble Selection](#staff-rotation-rest-and-scramble-selection)
8. [Production Deployment](#production-deployment)
9. [Known Limitations](#known-limitations)

---

## Pipeline Overview

The pipeline runs in **3 phases** (defined in `run_pipeline.js`):

```
Phase 1 — Import + Teams:
  prep/import.cs           → Set volunteer/delegate/team-lead properties on persons
  prep/add_missing_staff.cs → Mark Angie Casallas as volunteer (no WCA ID yet)
  prep/overrides.cs        → Remove/promote delegates, exclusions
  prep/populate_r1.cs      → Create empty R1 results from registrations
  prep/create_groups.cs    → Create 219 group child activities in schedule
  prep/volunteer_teams.cs  → Cluster staff into 4 balanced teams

Phase 2 — Group Assignments:
  groups/r1/*.cs           → Assign competitors to R1 groups (16 events)
                             Staff forced to their team's room via StaffRoomScorers

Phase 3 — Staff Assignments:
  volunteers/day1-4.cs     → Assign judges/scramblers/runners/delegates per group
```

**Important**: Split into 3 phases because `Cluster()` blocks subsequent expressions in Node.js runner. Phase 2 needs `staff-team` from Phase 1 to enforce room constraints.

### Role Hierarchy

| Property | Who | Count | What they do |
|----------|-----|-------|-------------|
| `TEAM_LEAD` | Confirmed team leads | 8 (target 12) | Supervise groups (Delegate job only). Can compete and cover each other. |
| `STAGE_LEAD` | ALL delegates (incl. Junior/Trainee) | 37 | Internal marker for clustering. Junior/Trainee do staff work. |
| `VOLUNTEER` | Non-delegate staff | ~60 | Judge/scramble/run |

To change someone's role, edit `prep/overrides.cs`:
```
# Remove team lead (stays as delegate, does staff work):
DeleteProperty([2010ROSE03], TEAM_LEAD)

# Remove delegate status entirely (becomes regular volunteer):
DeleteProperty([2010ROSE03], STAGE_LEAD)
DeleteProperty([2010ROSE03], TEAM_LEAD)

# Promote someone to team lead:
SetProperty([2019LUCE01], TEAM_LEAD, true)

# Force someone onto a specific team (1-4):
SetProperty([2010ROSE03], STAFF_TEAM, 2)
```

---

## Step-by-Step Code Breakdown

### 1. `lib/_constants.cs` — Property Definitions

```
#define VOLUNTEER "volunteer"        → Boolean property on non-delegate staff
#define STAGE_LEAD "stage-lead"      → Boolean property on ALL delegates (internal marker)
#define TEAM_LEAD "team-lead"        → Boolean property on Full/Senior/Regional delegates (supervise only)
#define STAFF_TEAM "staff-team"      → Number (1-4) set by Cluster()
#define DELEGATE_RANK "delegate-rank" → String: "full", "senior", "junior", "trainee", "regional"
```

These are **CompScript extensions** stored on each person in the WCIF under `org.cubingusa.natshelper.v1.Person`. They persist across script runs.

**vs 2025**: 2025 had ~18 properties (CORE_VOLUNTEER, COMMENTATOR, WCA_BOOTH, DATA_TEAM, etc.). SAC is simpler — just volunteer/delegate distinction.

### 2. `lib/_rooms.cs` — Room Constants

```
#define ZONA_AMARILLA "Zona Amarilla"
#define ZONA_AZUL "Zona Azul"
#define ZONA_ROJA "Zona Roja"
#define SALA_BLD "Zona Morada (Sala BLD)"
Define("AllRooms", [ZONA_AMARILLA, ZONA_AZUL, ZONA_ROJA])
```

`AllRooms()` is a UDF that returns the 3 main competition rooms as an array. Used with `Map()` to create groups in all rooms at once.

**vs 2025**: 2025 had 2 halls (Main Hall with 6 stages, Ballroom with 4 stages = 10 stages total). SAC has 3 equal rooms + 1 BLD room. Much simpler.

### 3. `prep/import.cs` — Staff Import

Sets `VOLUNTEER`, `STAGE_LEAD`, and `DELEGATE_RANK` properties on persons by WCA ID:

```
SetProperty([2016REAT01, 2007HERN02, ...], VOLUNTEER, true)
SetProperty([2016REAT01, 2007HERN02, ...], STAGE_LEAD, true)
SetProperty([2016REAT01, 2007HERN02, ...], DELEGATE_RANK, "full")
```

**Key constraints**:
- WCA IDs must be **UPPERCASE** (e.g., `2019GUAM01` not `2019guam01`)
- Persons must exist in the WCIF (registered for competition)
- 15 people are PENDING registration — commented out with `# PENDING:` markers
- Arrays must be on a **single line** (CompScript parser doesn't support multi-line arrays)

**vs 2025**: 2025 imported from a Google Spreadsheet via `ReadSpreadsheet()`. SAC uses hardcoded WCA IDs from Excel files processed manually.

### 4. `prep/add_missing_staff.cs` — People Without WCA IDs

```
SetProperty([p520057], VOLUNTEER, true)  # Angie Casallas (wcaUserId=520057)
```

Uses `p{wcaUserId}` syntax to reference persons by WCA user ID when they don't have a WCA competition ID yet.

### 5. `prep/populate_r1.cs` — R1 Results

```
AddResults(_777-r1, Persons(CompetingIn(_777)))
```

Creates empty result entries for all registered competitors in each R1. **This is necessary** because `AssignGroups` reads `round.results` to determine who competes. Pre-competition WCIFs have empty results.

**vs 2025**: 2025 didn't need this because their WCIF was fetched during/after the competition started.

### 6. `prep/create_groups.cs` — Group Creation

Creates child activities (groups) within parent schedule activities:

```
Map(AllRooms(), CreateGroups(_777-r1, GROUPS_777, 2026-06-12T13:15, 2026-06-12T14:45))
```

This calls `CreateGroups(activityCode, count, roomOrStage, start, end)` for each room. The `roomOrStage` parameter is provided by `Map()` via the `canBeExternal` mechanism.

**Group counts** (`lib/_group_counts.cs`):
- Groups per room = `scrambleSetCount` from the WCIF round
- Total groups = groups_per_room x number_of_rooms
- e.g., 3x3 R1: 6 groups/room x 3 rooms = 18 groups, ~27 competitors each

**Time division**: Groups evenly divide the parent activity's time window. E.g., 7x7 R1 in Zona Amarilla (13:15-14:45 = 90 min) with 2 groups = 45 min each.

**vs 2025**: 2025 used `Map(MainStages(), CreateGroups(...))` and `Map(SideStages(), CreateGroups(...))` with different group counts per hall. Their `build_schedule.cs` also created rooms, stages, and misc activities from scratch.

### 7. `groups/r1/*.cs` — Competitor Group Assignment

```
AssignGroups(_777-r1,
             RoundOneAssignmentSets(_777, 2026-06-12),
             Concat(DefaultScorers(),
                    [ByFilters(CompetingIn(_666), (EndTime() > 2026-06-12T14:30), -100)]))
```

**`AssignGroups(round, assignmentSets, scorers)`** — The core function.

**Assignment Sets** (`groups/lib/_assignment_sets.cs`):
```
RoundOneAssignmentSets(event, date) = [
  AssignmentSet("stage-leads", filter=STAGE_LEAD & CompetingIn, groups=all),
  AssignmentSet("volunteers", filter=VOLUNTEER & !STAGE_LEAD & CompetingIn, groups=all),
  AssignmentSet("competitors", filter=CompetingIn, groups=all),
]
```

Sets are processed **in order**. Stage leads get distributed first (evenly across all groups), then volunteers, then everyone else. Each person only gets assigned once — if already assigned by an earlier set, they're skipped.

**Scorers** (`groups/lib/_scorers.cs`):
```
DefaultScorers() = [
  ByMatchingValue(Country(), 3, limit=2),    → Pair 2 from same country (+3)
  ByMatchingValue(Country(), -1),             → But penalize clustering more (-1)
  ByFilters(true, (Mod(GroupNumber(), 2)==1), 1), → Prefer odd groups
  ByFilters(true, (Mod(GroupNumber(), 4)==1), 1), → Prefer every 4th group
  RecentlyCompeted(true, true, ...),          → Penalize same-room back-to-back
]

StaffRoomScorersDay{1-4}() = [
  ByFilters(team==X, Room()!=assigned_room, -5000),  → Force staff to their room
  # One per non-floating team. Floating team has no constraint.
]
```

**Adjacent event penalty**: Each R1 script adds a `-100` penalty for people who compete in the next event and would be assigned to a late group. This ensures they finish early enough to move to the next event.

**Staff room constraint**: Each R1 script includes `StaffRoomScorersDay{N}()` which penalizes staff being placed in any room other than their team's assigned room that day. The floating team has no room constraint. Verified: **100% compliance**.

**vs 2025**: 2025 had much more complex assignment sets: top competitors to finals stages, main hall vs ballroom split based on psychsheet position, data entry team to specific stages, commentators to red stage. SAC treats all 3 rooms equally.

### 8. `volunteers/day1-4.cs` — Staff Assignment

```
AssignStaff(_777-r1, (Room() == "Zona Amarilla"),
            Persons(Or(BooleanProperty("volunteer"), BooleanProperty("stage-lead"))),
            [Job("judge", 6, eligibility=...),
             Job("scrambler", 2, eligibility=...),
             Job("runner", 2, eligibility=...),
             Job("Delegate", 2, eligibility=...)],
            [], overwrite=true)
```

**`AssignStaff(round, groupFilter, persons, jobs, scorers)`** assigns staff roles to groups.

**Jobs per group (main rooms)**:
| Role | Count | Eligibility |
|------|-------|-------------|
| judge | 10 | Volunteers + Jr/Trainee delegates (not team leads) |
| scrambler | 4 | Volunteers + Jr/Trainee delegates (target: update to 3) |
| runner | 4 | Volunteers + Jr/Trainee delegates (target: update to 3) |
| Delegate | 1 | Any stage lead (delegate) |

**Key behaviors**:
- `avoidConflicts=true` (default): Never staff a group that overlaps your competing group
- `overwrite=true`: Reassign if already assigned (needed for dryrun mode)
- Staff are drawn from ALL volunteers + delegates, not just the team for that room

**Important**: Day scripts use **direct** `AssignStaff()` calls, NOT UDF wrappers. UDF-wrapped `AssignStaff()` calls don't work in the Node.js pipeline runner (CompScript limitation).

**vs 2025**: 2025 used elaborate UDFs (`DoVolunteerAssignments`, `ThursdayAssignmentsForStage`) that filtered staff by their assigned stage and day. They had specialized roles (data entry, commentators, scramble checkers). SAC is uniform — same jobs everywhere.

### 9. `prep/volunteer_teams.cs` — Team Clustering

```
Cluster(STAFF_TEAM, 4, Persons(...), Country(), Concat([constraints...]))
```

**`Cluster(property, numTeams, persons, preCluster, constraints)`** uses an optimization algorithm to distribute persons into balanced teams.

- `property`: The property name to set (1-4)
- `numTeams`: 4
- `preCluster`: `Country()` — ensures same-country people start in the same initial cluster
- `constraints`: Array of balance/limit rules

**Constraints used**:
```
LimitConstraint("Team Leads", BooleanProperty(TEAM_LEAD), 2, 2)
  → Hard limit: exactly 2 team leads per team (target: 3 when all confirmed)

BalanceConstraint("Delegates", HasRole("delegate"), 5)
  → Soft balance: minimize delegate count variance, weight=5

BalanceConstraint("Num Events", Length(RegisteredEvents()), 0.2)
  → Soft balance: even total event count per team

BalanceConstraint("Country CO", (Country() == "CO"), 1)
  → Spread Colombian volunteers evenly

BalanceConstraint("333bf", CompetingIn(_333bf), 3)
  → Spread BLD competitors evenly (weight=3)
```

**vs 2025**: 2025 had 10 teams with ~30 constraints including scrambler eligibility per event, accommodation preferences, long-room preferences, role preferences, and `SpecificAssignmentScore` for Chinese teams and specific individuals. SAC has 4 teams with ~20 constraints.

---

## Group Assignment Algorithm

CompScript uses a **linear programming (LP) solver** (`javascript-lp-solver`):

1. **Get eligible persons**: From `round.results` (populated by `AddResults`)
2. **Get groups**: All child activities in the round across all rooms
3. **Build conflict map**: For each group, find all other groups that overlap in time
4. **For each AssignmentSet** (in order):
   - Filter eligible groups and people
   - Build LP model:
     - **Variables**: One binary variable per (person, group) pair
     - **Constraints**: Each person assigned to exactly 1 group; group sizes balanced within ±1
     - **Objective**: Maximize total score from all scorers
   - Solve LP → get optimal assignment
5. **Apply assignments**: Add to `person.assignments` with `assignmentCode: "competitor"`

---

## Staff Assignment Algorithm

`AssignStaff` uses a different solver:

1. **Get groups** for the round, filtered by `groupFilter` (e.g., one room)
2. **For each group**:
   - For each job (judge, scrambler, runner, delegate):
     - Filter eligible persons (by job eligibility + not conflicting)
     - Score each eligible person using scorers
     - Pick the top N persons (N = job count)
3. **Apply assignments**: Add to `person.assignments` with `assignmentCode: "staff-{role}"`

---

## Team Clustering

The `Cluster()` algorithm:

1. **Pre-cluster** by the given property (Country) — people from same country start together
2. **Iteratively swap** people between teams to optimize constraint satisfaction
3. **Balance constraints** minimize the variance of a property across teams
4. **Limit constraints** enforce hard min/max bounds per team
5. Output: sets `staff-team` property (1-4) on each person

---

## Comparison with 2025 US Nationals

| Aspect | 2025 US Nationals | SAC 2026 |
|--------|-------------------|----------|
| **Competitors** | ~3,000 | ~500 |
| **Staff** | ~300 | ~97 |
| **Rooms** | 2 halls (Main + Ballroom) | 3 rooms + BLD |
| **Stages** | 10 (6 Main + 4 Side) | 3 (rooms are stages) |
| **Teams** | 10 | 4 |
| **Events** | 18 | 16 |
| **Group counts** | 10-20 per stage per event | 2-6 per room per event |
| **Data import** | Google Sheets via `ReadSpreadsheet` | Hardcoded WCA IDs |
| **Psych sheet routing** | Top → finals stages, mid → main, rest → ballroom | All rooms equal |
| **Staff roles** | judge, scrambler, runner, delegate, data entry, commentator | judge, scrambler, runner, delegate |
| **Scramble eligibility** | `CanScramble(event)` with PB check | Any volunteer |
| **Rest scorers** | `FollowingGroupScorer`, `UnavailableBetween`, `BeforeTimes` | None (avoidConflicts only) |
| **Schedule creation** | Full schedule built from scratch | Uses existing WCA schedule |

### Best practices from 2025 we follow:
- Priority-based assignment sets (stage leads first)
- Country diversity scoring
- Adjacent event conflict avoidance
- Balanced team clustering with multiple constraints
- Separate scripts per day for staff

### Best practices from 2025 we DON'T follow (yet):
- `CanScramble(event)` for scrambler eligibility (needs PB data)
- Psychsheet-based group routing (top competitors to specific rooms)
- Data entry team assignments (score takers pending)
- Sanity check tables after each group assignment

### Best practices from 2025 we NOW follow:
- ~~Stage-based staff routing~~ → Implemented via StaffRoomScorers (R58, 100% compliance)
- ~~Rest/break scorers~~ → FollowingGroupScorer(-50) + JobCountScorer(-5) implemented

---

## Staff Rotation, Rest, and Scramble Selection

### How staff rotation works:
- `avoidConflicts=true` (default in AssignStaff) guarantees you're **never staffing and competing at the same time**
- Staff are drawn from the full pool — the solver picks people who aren't competing in overlapping groups
- In practice: if you compete in group 1, you'll likely staff group 2 or later

### Rest guarantees:
- **Implemented**: `FollowingGroupScorer(-50)` penalizes staffing the group right after competing
- **Implemented**: `JobCountScorer(-5)` spreads workload evenly
- **Guarantee**: `avoidConflicts=true` ensures you're never staffing and competing at the same time

### Staff room constraint:
- **Implemented**: `StaffRoomScorersDay{1-4}()` forces staff to compete in their team's assigned room
- Floating team (1 per day) has no room constraint
- **Verified: 100% compliance**

### Scramble selection:
- **Currently**: Any volunteer can scramble any event
- **To add**: Use `CanScramble(event)` in scrambler Job eligibility — checks if person's PB is fast enough

---

## Production Deployment

### Prerequisites
1. A `.env.PROD` file in compscript with real WCA OAuth credentials:
   ```
   NODE_ENV=production
   SCHEME='https'
   HOST='your-server.com'
   PORT=3030
   WCA_HOST='https://www.worldcubeassociation.org'
   API_KEY='your-oauth-app-id'
   API_SECRET='your-oauth-app-secret'
   COOKIE_SECRET='random-secret'
   SCRIPT_BASE='../scc-scripts/2026-sac'
   ```

2. Register an OAuth application at https://www.worldcubeassociation.org/oauth/applications with scope `public manage_competitions`

### Deployment steps

1. **Remove `SKIP_AUTH`** from `.env.PROD` (don't add it)
2. **Start compscript in prod mode**: `cd compscript && ENV=PROD npm start`
3. **Log in** via the WCA OAuth flow (you must be a delegate/organizer for SAC2026)
4. **Navigate** to `http://localhost:3030/SAC2026`
5. **Run scripts one at a time** in the order below (see detailed table)
6. **Verify** at https://competitiongroups.com/competitions/SAC2026

### Script execution order (production)

Scripts must be run one at a time in the compscript server UI because:
- The server has HTTP timeouts — the full pipeline is too large for one request
- You can verify each step's output before continuing
- If something fails, you know exactly where
- `Cluster()` blocks subsequent expressions, so `volunteer_teams.cs` must be last

| Step | Script | Dry Run first? | What to check |
|------|--------|---------------|---------------|
| 1 | `prep/import.cs` | Yes | 8 team leads + 29 other delegates + ~60 volunteers |
| 2 | `prep/add_missing_staff.cs` | Yes | Angie Casallas marked as volunteer |
| 3 | `prep/overrides.cs` | Yes | 5 delegates removed, 4 promoted, 8 demoted |
| 4 | `prep/populate_r1.cs` | Yes | "Added N results" per event (198 for 777, 493 for 333, etc.) |
| 5 | `prep/create_groups.cs` | **No** — must save | "Added group" messages for all 4 days. **NOT idempotent** — running twice creates duplicates! |
| 6 | `groups/r1/777.cs` | Yes then No | 6 groups with ~33 competitors each |
| 7 | `groups/r1/666.cs` | Yes then No | 6 groups with ~36 each |
| 8 | `groups/r1/minx.cs` | Yes then No | 9 groups with ~34 each |
| 9 | `groups/r1/sq1.cs` | Yes then No | 6 groups with ~38 each |
| 10 | `groups/r1/clock.cs` | Yes then No | 9 groups with ~31 each |
| 11 | `groups/r1/555.cs` | Yes then No | 9 groups with ~34 each |
| 12 | `groups/r1/444.cs` | Yes then No | 12 groups with ~33 each |
| 13 | `groups/r1/skewb.cs` | Yes then No | 9 groups with ~34 each |
| 14 | `groups/r1/333.cs` | Yes then No | 18 groups with ~27 each |
| 15 | `groups/r1/333bf.cs` | Yes then No | 9 groups with ~17 each |
| 16 | `groups/r1/333oh.cs` | Yes then No | 9 groups with ~41 each |
| 17 | `groups/r1/222.cs` | Yes then No | 15 groups with ~30 each |
| 18 | `groups/r1/pyram.cs` | Yes then No | 15 groups with ~25 each |
| 19 | `groups/r1/555bf.cs` | Yes then No | 1 group, 17 competitors |
| 20 | `groups/r1/444bf.cs` | Yes then No | 1 group, 24 competitors |
| 21 | `groups/r1/333mbf.cs` | Yes then No | 1 group, 10 competitors |
| 22 | `volunteers/day1.cs` | Yes then No | Staff tables for 7x7, 6x6, Mega, Sq1, Clock, 5x5 + R2s |
| 23 | `volunteers/day2.cs` | Yes then No | Staff for Clock R2, 4x4, Skewb, 3x3, BLD |
| 24 | `volunteers/day3.cs` | Yes then No | Staff for 3BLD, 4x4 R2, OH, 2x2, Pyram, 3x3 R2 |
| 25 | `volunteers/day4.cs` | Yes then No | Staff for Semis + Finals |
| 26 | `prep/volunteer_teams.cs` | Yes then No | 4 teams of ~24, 2 team leads each. **Run BEFORE group assignments** (pipeline Phase 1). |

### Safety notes
- Always run with **Dry Run ON** first to verify output, then **Dry Run OFF** to push to WCA
- The pipeline is idempotent for competitor groups (`AssignGroups` skips if already assigned unless `overwrite=true`)
- Staff assignments use `overwrite=true` so they replace existing assignments
- `CreateGroups` is **NOT idempotent** — running twice creates duplicate groups. Use "Clear Cache" checkbox to reset.
- If a staff script fails with "Failed to find a solution", reduce judge count from 6 to 4 for that round

---

## Known Limitations

1. **Cluster() blocks subsequent expressions** in Node.js runner — placed in Phase 1, separate from group assignments
2. **UDF-wrapped AssignStaff doesn't work** in Node.js runner — use direct `AssignStaff()` calls instead
3. **`All()` function swallows mutations** — don't wrap `AssignStaff()` in `All()`
4. **Multi-line arrays** not supported by CompScript parser — keep arrays on single lines
5. **`#` comments inside arrays** cause preprocessor issues — put comments before the array
6. **`SpecificAssignmentScore`** has a `var` bug in compscript (missing `let/const`) — use `BalanceConstraint` instead
7. **`CanScramble(event)`** works in server mode but may fail in Node.js runner
8. **ByFilters cache bug**: `groups/scorers.js` had a bug where cache key used `activityCode` for lookup but `wcif.id` for storage — fixed
9. **`[pN]` syntax uses wcaUserId**, not registrantId — `[p520057]` works, `[p300]` does not
10. **People pending registration** — listed in `import.cs` as PENDING comments and in `TODO.md`
11. **Midcomp scripts** can't run pre-competition (need actual results)
