# SAC 2026 - Staff para eventos no oficiales (Zona Verde / TARIMA)
#
# Eventos no oficiales no requieren Delegate (se cubre fuera del script WCA).
# Maarten Goossens (2024GOOS03) es "Lead" de los no oficiales — asignado como
# supervisor a cada evento vía BooleanProperty("unofficial_lead"). Maarten está
# fuera del pool de staff regular (ver overrides.cs).
#
# Elegibilidad para judge/scrambler/runner: abierta a cualquier staff con
# staff-team (team-leads incluidos porque suelen ser los únicos disponibles
# de noche). AvoidConflicts previene doble-booking.
#
# Preferencia fuerte al team flotante del día (scorer +300). Si no alcanza,
# completa con otros teams.
#
# Conflicto de horario conocido (ver TODO.md):
#   - Mirror Blocks R1 (121, Day 1 18:45-21:15) corre paralelo a Sq1/Clock/5x5 R1
#   - FTO R1 (123, Day 3 19:00-22:00) corre paralelo a 2x2/Pyram R1 + 4BLD
# Para esos 2 eventos hay pocos staff elegibles (9 y 3 respectivamente).
# La recomendación es moverlos a horario de mañana (08:00-12:45) donde las
# 3 salas principales están IDLE.

# --- Day 1 (2026-06-12) — Mirror Blocks R1 — flotante T4 ---
# Staffing reducido (7 total) porque corre en paralelo con Sq1/Clock/5x5 en main rooms
# (con Delegate=3 en main, solo ~7 staff libres durante esa ventana).
AssignMisc(121, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("stage-lead"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 3, eligibility=HasProperty("staff-team")), Job("scrambler", 1, eligibility=HasProperty("staff-team")), Job("runner", 1, eligibility=HasProperty("staff-team"))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 4), 300)], overwrite=true)

# --- Day 2 (2026-06-13) — Kilominx R1 — flotante T1 ---
AssignMisc(122, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("stage-lead"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 9, eligibility=HasProperty("staff-team")), Job("scrambler", 2, eligibility=HasProperty("staff-team")), Job("runner", 2, eligibility=HasProperty("staff-team"))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 1), 300)], overwrite=true)

# --- Day 3 (2026-06-14) — FTO R1 — flotante T2 ---
# Staffing ULTRA mínimo (1 = solo Lead) porque corre en paralelo con 2x2/Pyram R1 + 4BLD + MBLD:
# con Delegate=3 en main, prácticamente nadie libre excepto Maarten. Supervisa él solo;
# jueces/scramblers se rotarán en vivo con voluntarios casuales.
AssignMisc(123, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("stage-lead"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead"))], [FollowingGroupScorer(-50), JobCountScorer(-5)], overwrite=true)

# --- Day 3 (2026-06-14) — Team Blind 3x3 R1 — flotante T2 ---
AssignMisc(124, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("stage-lead"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 9, eligibility=HasProperty("staff-team")), Job("scrambler", 2, eligibility=HasProperty("staff-team")), Job("runner", 2, eligibility=HasProperty("staff-team"))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 2), 300)], overwrite=true)

# --- Day 3 (2026-06-14) — Mirror Final — flotante T2 ---
AssignMisc(125, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("stage-lead"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 9, eligibility=HasProperty("staff-team")), Job("scrambler", 2, eligibility=HasProperty("staff-team")), Job("runner", 2, eligibility=HasProperty("staff-team"))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 2), 300)], overwrite=true)

# --- Day 3 (2026-06-14) — Kilominx Final — flotante T2 ---
AssignMisc(126, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("stage-lead"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 9, eligibility=HasProperty("staff-team")), Job("scrambler", 2, eligibility=HasProperty("staff-team")), Job("runner", 2, eligibility=HasProperty("staff-team"))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 2), 300)], overwrite=true)

# --- Day 4 (2026-06-15) — FTO Final — flotante T3 ---
AssignMisc(127, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("stage-lead"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 9, eligibility=HasProperty("staff-team")), Job("scrambler", 2, eligibility=HasProperty("staff-team")), Job("runner", 2, eligibility=HasProperty("staff-team"))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 3), 300)], overwrite=true)

# --- Day 4 (2026-06-15) — Team Blind 3x3 Final — flotante T3 ---
AssignMisc(128, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("stage-lead"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 9, eligibility=HasProperty("staff-team")), Job("scrambler", 2, eligibility=HasProperty("staff-team")), Job("runner", 2, eligibility=HasProperty("staff-team"))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 3), 300)], overwrite=true)
