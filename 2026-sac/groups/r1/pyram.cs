#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# Pyraminx R1: June 14, 20:30-22:10 (3 rooms, 5 groups each)
# Adjacent: 3x3 R2 starts at 22:10
AssignGroups(_pyram-r1,
             RoundOneAssignmentSets(_pyram, 2026-06-14),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay3(),
                    [ByFilters(CompetingIn(_333), (EndTime() > 2026-06-14T21:55), -100)]))
