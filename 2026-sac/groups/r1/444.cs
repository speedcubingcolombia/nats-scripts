#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 4x4 R1: June 13, 14:00-16:10 (3 rooms, 4 groups each)
# Adjacent: Skewb R1 starts at 16:10
AssignGroups(_444-r1,
             RoundOneAssignmentSets(_444, 2026-06-13),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay2(),
                    [ByFilters(CompetingIn(_skewb), (EndTime() > 2026-06-13T15:55), -100)]))
