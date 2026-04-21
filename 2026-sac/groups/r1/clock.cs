#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# Clock R1: June 12, 19:45-20:55 (3 rooms, 3 groups each)
# Adjacent: 5x5 R1 starts at 20:55
AssignGroups(_clock-r1,
             RoundOneAssignmentSets(_clock, 2026-06-12),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay1(),
                    [ByFilters(CompetingIn(_555), (EndTime() > 2026-06-12T20:40), -100)]))
