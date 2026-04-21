#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 3x3 R1: June 13, 20:10-22:20 (3 rooms, 6 groups each)
# Adjacent: Clock R3 at 22:20 (only 16 people), Minx R2 at 22:40
# Also: 3x3 Multi-BLD attempt 1 runs 21:10-22:20 in BLD room
AssignGroups(_333-r1,
             RoundOneAssignmentSets(_333, 2026-06-13),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay2(),
                    [ByFilters(CompetingIn(_333mbf), (EndTime() > 2026-06-13T21:00), -100)]))
