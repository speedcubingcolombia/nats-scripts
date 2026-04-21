#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 3x3 OH R1: June 14, 15:40-17:25 (3 rooms, 3 groups each)
# No immediate R1 conflict (lunch at 17:25, 2x2 R1 at 18:40)
# 3x3 Multi-BLD attempt 2 runs 16:15-17:25 in BLD room
AssignGroups(_333oh-r1,
             RoundOneAssignmentSets(_333oh, 2026-06-14),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay3(),
                    [ByFilters(CompetingIn(_333mbf), (EndTime() > 2026-06-14T16:00), -100)]))
