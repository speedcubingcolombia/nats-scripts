#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 3x3 R1: June 13, 20:10-22:20 (3 rooms, 6 groups each)
ManuallyAssign(Persons((WcaId() == "2017POPA01")), _333-r1, ZONA_ROJA, 1)
ManuallyAssign(Persons((WcaId() == "2017SOUZ14")), _333-r1, ZONA_ROJA, 1)
AssignGroups(_333-r1,
             RoundOneAssignmentSets(_333, 2026-06-13),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay2(),
                    [ByFilters(CompetingIn(_333mbf), (StartTime() > 2026-06-13T20:45), -10000),
                     ByFilters((NumberProperty(STAFF_TEAM) == 1), (StartTime() > 2026-06-13T21:00), -10000),
                     ByFilters(BooleanProperty("force-g1-333"), Not((GroupNumber() == 1)), -200000),
                     ByFilters(BooleanProperty("force-g2-333"), Not((GroupNumber() == 2)), -200000),
                     ByFilters(BooleanProperty("force-g3-333"), Not((GroupNumber() == 3)), -200000),
                     ByFilters(BooleanProperty("force-g4-333"), Not((GroupNumber() == 4)), -200000),
                     ByFilters(BooleanProperty("force-g5-333"), Not((GroupNumber() == 5)), -200000),
                     ByFilters(BooleanProperty("force-g6-333"), Not((GroupNumber() == 6)), -200000)]),
             overwrite=true)
