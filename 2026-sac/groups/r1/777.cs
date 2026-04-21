#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 7x7 R1: June 12, 13:15-14:45 (3 rooms, 2 groups each)
# Adjacent: 6x6 R1 starts at 14:45
AssignGroups(_777-r1,
             RoundOneAssignmentSets(_777, 2026-06-12),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay1(),
                    [ByFilters(CompetingIn(_666), (EndTime() > 2026-06-12T14:30), -100)]))
