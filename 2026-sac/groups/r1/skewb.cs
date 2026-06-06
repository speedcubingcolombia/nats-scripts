#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# Skewb R1: June 13, 16:10-17:30 (3 rooms, 3 groups each)
AssignGroups(_skewb-r1,
             RoundOneAssignmentSets(_skewb, 2026-06-13),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay2(),
                    [ByFilters(BooleanProperty("force-g1-skewb"), Not((GroupNumber() == 1)), -200000),
                     ByFilters(BooleanProperty("force-g2-skewb"), Not((GroupNumber() == 2)), -200000),
                     ByFilters(BooleanProperty("force-g3-skewb"), Not((GroupNumber() == 3)), -200000)]))
