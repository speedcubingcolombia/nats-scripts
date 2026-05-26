#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# Square-1 R1: June 12, 18:45-19:45 (3 rooms, 2 groups each)
# Adjacent: Clock R1 starts at 19:45
# Mirror R1 (18:45-21:15) overlaps — push float T4 to G1
# Maarten (unofficial_lead) to G1 so he can Lead Mirror G2+ (starts 14:35 local)
# Stronger room penalty for SQ1 to prevent cross-zone assignments
AssignGroups(_sq1-r1,
             RoundOneAssignmentSets(_sq1, 2026-06-12),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay1(),
                    [ByFilters(CompetingIn(_clock), (EndTime() > 2026-06-12T19:30), -100),
                     ByFilters((NumberProperty(STAFF_TEAM) == 4), (StartTime() > 2026-06-12T19:00), -10000),
                     ByFilters(BooleanProperty("unofficial_lead"), (StartTime() > 2026-06-12T19:00), -10000),
                     ByFilters(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 1)), Not((Room() == ZONA_AMARILLA)), -50000),
                     ByFilters(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 2)), Not((Room() == ZONA_AZUL)), -50000),
                     ByFilters(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 3)), Not((Room() == ZONA_ROJA)), -50000),
                     ByFilters(BooleanProperty("unoff-mirror"), (StartTime() > 2026-06-12T19:00), -5000)]))
