#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 7x7 R1: June 12, 13:15-14:45 (3 rooms, 2 groups each)
AssignGroups(_777-r1,
             RoundOneAssignmentSets(_777, 2026-06-12),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay1(),
                    [ByFilters(CompetingIn(_666), (EndTime() > 2026-06-12T14:30), -100),
                     ByFilters(BooleanProperty("force-g1-777"), Not((GroupNumber() == 1)), -200000),
                     ByFilters(BooleanProperty("force-g2-777"), Not((GroupNumber() == 2)), -200000)]))
