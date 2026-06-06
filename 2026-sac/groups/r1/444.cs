#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 4x4 R1: June 13, 14:00-16:10 (3 rooms, 4 groups each)
ManuallyAssign(Persons((WcaId() == "2017SOUZ14")), _444-r1, ZONA_ROJA, 1)
AssignGroups(_444-r1,
             RoundOneAssignmentSets(_444, 2026-06-13),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay2(),
                    [ByFilters(CompetingIn(_skewb), (EndTime() > 2026-06-13T15:55), -100),
                     ByFilters(CompetingIn(_555bf), (StartTime() > 2026-06-13T14:20), -10000),
                     ByFilters((NumberProperty(STAFF_TEAM) == 1), (StartTime() > 2026-06-13T14:20), -10000),
                     ByFilters(BooleanProperty("unoff-kilominx"), (StartTime() > 2026-06-13T14:20), -5000),
                     ByFilters(BooleanProperty("force-g1-444"), Not((GroupNumber() == 1)), -200000),
                     ByFilters(BooleanProperty("force-g2-444"), Not((GroupNumber() == 2)), -200000),
                     ByFilters(BooleanProperty("force-g3-444"), Not((GroupNumber() == 3)), -200000),
                     ByFilters(BooleanProperty("force-g4-444"), Not((GroupNumber() == 4)), -200000)]),
             overwrite=true)
