#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 3x3 BLD R1: June 14, 13:15-14:15 (3 rooms, 3 groups each)
# Adjacent: 4x4 R2 starts at 14:15
AssignGroups(_333bf-r1,
             RoundOneAssignmentSets(_333bf, 2026-06-14),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay3(),
                    [ByFilters(CompetingIn(_444), (EndTime() > 2026-06-14T14:00), -100)]))
