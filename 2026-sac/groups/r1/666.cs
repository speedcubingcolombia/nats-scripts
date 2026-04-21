#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 6x6 R1: June 12, 14:45-16:05 (3 rooms, 2 groups each)
# Adjacent: Megaminx R1 starts at 16:05
AssignGroups(_666-r1,
             RoundOneAssignmentSets(_666, 2026-06-12),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay1(),
                    [ByFilters(CompetingIn(_minx), (EndTime() > 2026-06-12T15:50), -100)]))
