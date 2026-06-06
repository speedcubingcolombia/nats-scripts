#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 5x5 R1: June 12, 20:55-22:45 (3 rooms, 3 groups each)
AssignGroups(_555-r1,
             RoundOneAssignmentSets(_555, 2026-06-12),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay1(),
                    [ByFilters((NumberProperty(STAFF_TEAM) == 4), (EndTime() < 2026-06-12T22:30), -10000),
                     ByFilters(BooleanProperty("unoff-mirror"), (EndTime() < 2026-06-12T22:30), -5000),
                     ByFilters(BooleanProperty("force-g1-555"), Not((GroupNumber() == 1)), -200000),
                     ByFilters(BooleanProperty("force-g2-555"), Not((GroupNumber() == 2)), -200000),
                     ByFilters(BooleanProperty("force-g3-555"), Not((GroupNumber() == 3)), -200000)]))
