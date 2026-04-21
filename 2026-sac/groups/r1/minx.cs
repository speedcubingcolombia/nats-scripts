#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# Megaminx R1: June 12, 16:05-17:45 (3 rooms, 3 groups each)
# No adjacent R1 conflicts (lunch follows, then sq1 at 18:45)
AssignGroups(_minx-r1,
             RoundOneAssignmentSets(_minx, 2026-06-12),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay1()))
