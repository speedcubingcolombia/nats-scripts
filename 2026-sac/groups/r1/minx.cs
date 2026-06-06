#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# Megaminx R1: June 12, 16:05-17:45 (3 rooms, 3 groups each)
AssignGroups(_minx-r1,
             RoundOneAssignmentSets(_minx, 2026-06-12),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay1(),
                    [ByFilters(BooleanProperty("force-g1-minx"), Not((GroupNumber() == 1)), -200000),
                     ByFilters(BooleanProperty("force-g2-minx"), Not((GroupNumber() == 2)), -200000),
                     ByFilters(BooleanProperty("force-g3-minx"), Not((GroupNumber() == 3)), -200000)]))
