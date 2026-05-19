# SAC 2026 - Staff para eventos unofficial (Zona Verde / TARIMA)
#
# Unofficial events do not require Delegate (handled outside WCA script).
# Maarten Goossens (2024GOOS03) es "Lead" de los unofficial — assigned as
# supervisor for each event via BooleanProperty("unofficial_lead"). Maarten está
# out of staff pool regular (see overrides.cs).
#
# Eligibility for judge/scrambler/runner: open to any staff with
# staff-team (team-leads included as they tend to be the only ones available
# at night). AvoidConflicts prevents double-booking.
#
# Strong preference for team floating of the day (scorer +300). Si no alcanza,
# completa con otros teams.
#
# Known schedule conflict (ver TODO.md):
#   - Mirror Blocks R1 (121, Day 1 18:45-21:15) runs parallel to Sq1/Clock/5x5 R1
#   - FTO R1 (123, Day 3 19:00-22:00) runs parallel to 2x2/Pyram R1 + 4BLD
# For those 2 events there are pocos staff eligible (9 y 3 respectivamente).
# Recommendation: move to morning schedule (08:00-12:45) where
# 3 main rooms are IDLE.

# --- Day 1 (2026-06-12) — Mirror Blocks R1 — floating T4 ---
# Runs in parallel con Sq1/Clock/5x5. Target 8 judges, flexible min=4.
AssignMisc(121, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 8, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 4))), Job("scrambler", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 4), BooleanProperty("can-scramble-333"))), Job("runner", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 4)))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 4), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

# --- Day 2 (2026-06-13) — Kilominx R1 — floating T1 ---
AssignMisc(122, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 8, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 1))), Job("scrambler", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 1), BooleanProperty("can-scramble-333"))), Job("runner", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 1)))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 1), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

# --- Day 3 (2026-06-14) — FTO R1 — floating T2 ---
# Runs in parallel con 2x2/Pyram R1 + 4BLD. Target 8 judges, flexible min=4.
AssignMisc(123, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 8, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2))), Job("scrambler", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2), BooleanProperty("can-scramble-333"))), Job("runner", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2)))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 2), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

# --- Day 3 (2026-06-14) — Team Blind 3x3 R1 — floating T2 ---
AssignMisc(124, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 8, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2))), Job("scrambler", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2), BooleanProperty("can-scramble-333"))), Job("runner", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2)))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 2), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

# --- Day 3 (2026-06-14) — Mirror Final — floating T2 ---
AssignMisc(125, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 8, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2))), Job("scrambler", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2), BooleanProperty("can-scramble-333"))), Job("runner", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2)))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 2), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

# --- Day 3 (2026-06-14) — Kilominx Final — floating T2 ---
AssignMisc(126, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 8, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2))), Job("scrambler", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2), BooleanProperty("can-scramble-333"))), Job("runner", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2)))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 2), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

# --- Day 4 (2026-06-15) — FTO Final — floating T3 ---
AssignMisc(127, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 8, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 3))), Job("scrambler", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 3), BooleanProperty("can-scramble-333"))), Job("runner", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 3)))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 3), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

# --- Day 4 (2026-06-15) — Team Blind 3x3 Final — floating T3 ---
AssignMisc(128, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 8, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 3))), Job("scrambler", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 3), BooleanProperty("can-scramble-333"))), Job("runner", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 3)))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 3), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)
