#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 2x2 R1: June 14, 18:40-20:30 (3 rooms, 5 groups each)
# Adjacent: Pyraminx R1 starts at 20:30
AssignGroups(_222-r1,
             RoundOneAssignmentSets(_222, 2026-06-14),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay3(),
                    [ByFilters(CompetingIn(_pyram), (EndTime() > 2026-06-14T20:15), -100)]))
