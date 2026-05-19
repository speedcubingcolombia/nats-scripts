#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 5x5 R1: June 12, 20:55-22:45 (3 rooms, 3 groups each)
# Adjacent: 7x7 R2 starts at 22:45 (only top 16 advance)
# Push TLs away from G1 so at least 1 TL is free to Delegate each group
AssignGroups(_555-r1,
             RoundOneAssignmentSets(_555, 2026-06-12),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay1(),
                    [ByFilters(BooleanProperty("team-lead"), (EndTime() < 2026-06-12T21:40), -500)]))
