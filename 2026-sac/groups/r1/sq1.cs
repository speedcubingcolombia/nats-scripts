#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# Square-1 R1: June 12, 18:45-19:45 (3 rooms, 2 groups each)
AssignGroups(_sq1-r1,
             RoundOneAssignmentSets(_sq1, 2026-06-12),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay1(),
                    [ByFilters(CompetingIn(_clock), (EndTime() > 2026-06-12T19:30), -100),
                     ByFilters((NumberProperty(STAFF_TEAM) == 4), (StartTime() > 2026-06-12T19:00), -10000),
                     ByFilters(BooleanProperty("unofficial_lead"), (StartTime() > 2026-06-12T19:00), -10000),
                     ByFilters(BooleanProperty("unoff-mirror"), (StartTime() > 2026-06-12T19:00), -5000),
                     ByFilters(BooleanProperty("force-g1-sq1"), Not((GroupNumber() == 1)), -200000),
                     ByFilters(BooleanProperty("force-g2-sq1"), Not((GroupNumber() == 2)), -200000)]))
