#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 5x5 R1: June 12, 20:55-22:45 (3 rooms, 3 groups each)
# Adjacent: 7x7 R2 starts at 22:45 (only top 16 advance)
AssignGroups(_555-r1,
             RoundOneAssignmentSets(_555, 2026-06-12),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay1()))
