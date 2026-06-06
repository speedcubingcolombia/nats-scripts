#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 3x3 BLD R1: June 14, 13:15-14:15 (3 rooms, 3 groups each)
AssignGroups(_333bf-r1,
             RoundOneAssignmentSets(_333bf, 2026-06-14),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay3(),
                    [ByFilters(CompetingIn(_444), (EndTime() > 2026-06-14T14:00), -100),
                     ByFilters(BooleanProperty("unoff-tb"), (StartTime() > 2026-06-14T13:30), -5000),
                     ByFilters(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 1)), Not((Room() == ZONA_ROJA)), -500000),
                     ByFilters(BooleanProperty("force-g1-333bf"), Not((GroupNumber() == 1)), -200000),
                     ByFilters(BooleanProperty("force-g2-333bf"), Not((GroupNumber() == 2)), -200000),
                     ByFilters(BooleanProperty("force-g3-333bf"), Not((GroupNumber() == 3)), -200000)]))
