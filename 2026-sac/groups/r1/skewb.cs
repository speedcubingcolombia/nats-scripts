#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# Skewb R1: June 13, 16:10-17:30 (3 rooms, 3 groups each)
# No immediate R1 conflict after (5x5 R2 at 17:30 is only 16 people)
AssignGroups(_skewb-r1,
             RoundOneAssignmentSets(_skewb, 2026-06-13),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay2()))
