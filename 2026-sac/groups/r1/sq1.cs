#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# Square-1 R1: June 12, 18:45-19:45 (3 rooms, 2 groups each)
# Adjacent: Clock R1 starts at 19:45
AssignGroups(_sq1-r1,
             RoundOneAssignmentSets(_sq1, 2026-06-12),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay1(),
                    [ByFilters(CompetingIn(_clock), (EndTime() > 2026-06-12T19:30), -100)]))
