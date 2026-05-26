#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# Clock R1: June 12, 19:45-20:55 (3 rooms, 3 groups each)
# Adjacent: 5x5 R1 starts at 20:55
# Mirror R1 (18:45-21:15) overlaps — push float T4 to G1
AssignGroups(_clock-r1,
             RoundOneAssignmentSets(_clock, 2026-06-12),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay1(),
                    [ByFilters(CompetingIn(_555), (EndTime() > 2026-06-12T20:40), -100),
                     ByFilters((NumberProperty(STAFF_TEAM) == 4), (StartTime() > 2026-06-12T19:55), -10000),
                     ByFilters(BooleanProperty("unoff-mirror"), (StartTime() > 2026-06-12T19:55), -5000)]))
