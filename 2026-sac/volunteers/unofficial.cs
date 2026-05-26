# SAC 2026 - Staff para eventos unofficial (Zona Verde / TARIMA)
#
# Events split into 3 groups each for better staff availability.
# Maarten Goossens (2024GOOS03) es "Lead" de los unofficial.
# Maarten: SQ1 G1 (libre para Mirror G2+), Pyram G5 (libre para FTO G1+G2).
# Eligibility: float team of the day. AvoidConflicts prevents double-booking.

# =============================================
# Day 1 (2026-06-12) — Mirror Blocks R1 — T4
# =============================================
# G1 (local 13:45-14:35): Maarten en SQ1 G1 — float TL as Delegate instead.
AssignMisc(121, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Delegate", 1, eligibility=And(BooleanProperty("team-lead"), (NumberProperty("staff-team") == 4))), Job("judge", 3, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"))), Job("scrambler", 1, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), BooleanProperty("can-scramble-333"))), Job("runner", 1, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team")))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 4), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

# G2 (local 14:35-15:25): Maarten libre → Lead.
AssignMisc(469, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 3, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"))), Job("scrambler", 1, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), BooleanProperty("can-scramble-333"))), Job("runner", 1, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team")))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 4), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

# G3 (local 15:25-16:15): Maarten libre → Lead.
AssignMisc(470, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 4, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"))), Job("scrambler", 1, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), BooleanProperty("can-scramble-333"))), Job("runner", 1, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team")))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 4), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

# =============================================
# Day 2 (2026-06-13) — Kilominx R1 — T1
# =============================================
# G1 (local 08:15-08:55): Maarten libre → Lead.
AssignMisc(122, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 8, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 1))), Job("scrambler", 1, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 1), BooleanProperty("can-scramble-333"))), Job("runner", 1, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 1)))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 1), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

# G2 (local 08:55-09:35): Maarten libre → Lead.
AssignMisc(471, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 3, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 1))), Job("scrambler", 1, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 1), BooleanProperty("can-scramble-333"))), Job("runner", 1, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 1)))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 1), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

# G3 (local 09:35-10:15): 0 free. Ad-hoc. Maarten libre → Lead si hay staff.
AssignMisc(472, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead"))], [FollowingGroupScorer(-50), JobCountScorer(-5)], overwrite=true)

# =============================================
# Day 3 (2026-06-14) — Team Blind R1 — T2
# =============================================
# G1 (local 09:00-10:00): Maarten libre → Lead.
AssignMisc(124, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 8, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2))), Job("scrambler", 1, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2), BooleanProperty("can-scramble-333"))), Job("runner", 1, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2)))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 2), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

# G2 (local 10:00-11:00): Maarten libre → Lead.
AssignMisc(475, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 3, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"))), Job("scrambler", 1, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), BooleanProperty("can-scramble-333"))), Job("runner", 1, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team")))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 2), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

# G3 (local 11:00-12:00): 0 free. Ad-hoc. Maarten libre → Lead si hay staff.
AssignMisc(476, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead"))], [FollowingGroupScorer(-50), JobCountScorer(-5)], overwrite=true)

# =============================================
# Day 3 (2026-06-14) — FTO R1 — T2
# =============================================
# G1 (local 14:00-15:00): Maarten libre → Lead. Exclude 4BLD staff.
AssignMisc(123, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 2, eligibility=And(Not(BooleanProperty("score-taker")), Not(CompetingIn(_444bf)), HasProperty("staff-team"))), Job("scrambler", 1, eligibility=And(Not(BooleanProperty("score-taker")), Not(CompetingIn(_444bf)), HasProperty("staff-team"), BooleanProperty("can-scramble-333")))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 2), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

# G2 (local 15:00-16:00): Maarten libre → Lead. 0 free staff. Ad-hoc judges.
AssignMisc(473, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead"))], [FollowingGroupScorer(-50), JobCountScorer(-5)], overwrite=true)

# G3 (local 16:00-17:00): Maarten en Pyram G5 — float TL as Delegate instead.
AssignMisc(474, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Delegate", 1, eligibility=And(BooleanProperty("team-lead"), (NumberProperty("staff-team") == 2))), Job("judge", 3, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"))), Job("scrambler", 1, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), BooleanProperty("can-scramble-333"))), Job("runner", 1, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team")))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 2), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

# =============================================
# Day 3 (2026-06-14) — Finals — T2
# =============================================
AssignMisc(125, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 8, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2))), Job("scrambler", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2), BooleanProperty("can-scramble-333"))), Job("runner", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2)))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 2), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

AssignMisc(126, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 8, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2))), Job("scrambler", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2), BooleanProperty("can-scramble-333"))), Job("runner", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 2)))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 2), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

# =============================================
# Day 4 (2026-06-15) — Finals — T3
# =============================================
AssignMisc(127, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 8, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 3))), Job("scrambler", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 3), BooleanProperty("can-scramble-333"))), Job("runner", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 3)))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 3), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)

AssignMisc(128, Persons(Or(BooleanProperty("volunteer"), BooleanProperty("listed-delegate"), BooleanProperty("unofficial_lead"))), [Job("Lead", 1, eligibility=BooleanProperty("unofficial_lead")), Job("judge", 8, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 3))), Job("scrambler", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 3), BooleanProperty("can-scramble-333"))), Job("runner", 2, eligibility=And(Not(BooleanProperty("score-taker")), HasProperty("staff-team"), (NumberProperty("staff-team") == 3)))], [FollowingGroupScorer(-50), JobCountScorer(-5), PersonPropertyScorer((NumberProperty("staff-team") == 3), 300), PersonPropertyScorer((NumberProperty("pref-scrambler") >= 7), 100)], overwrite=true)
