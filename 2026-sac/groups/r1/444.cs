#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 4x4 R1: June 13, 14:00-16:10 (3 rooms, 4 groups each)
# Adjacent: Skewb R1 starts at 16:10
# 555bf (15:00-16:10) overlaps — force T1 TLs to G1 so they're free for 555bf
ManuallyAssign(Persons((WcaId() == [2017SOUZ14])), _444-r1, ZONA_ROJA, 1)
AssignGroups(_444-r1,
             RoundOneAssignmentSets(_444, 2026-06-13),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay2(),
                    [ByFilters(CompetingIn(_skewb), (EndTime() > 2026-06-13T15:55), -100),
                     ByFilters(CompetingIn(_555bf), (StartTime() > 2026-06-13T14:20), -10000),
                     ByFilters(And(BooleanProperty("team-lead"), (NumberProperty("staff-team") == 1)), (StartTime() > 2026-06-13T14:20), -10000)]))
