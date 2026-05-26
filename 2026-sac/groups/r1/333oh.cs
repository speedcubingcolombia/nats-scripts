#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 3x3 OH R1: June 14, 15:40-17:25 (3 rooms, 3 groups each)
# MBLD att2 (16:15-17:25) overlaps — push MBLD competitors to early groups
# Push T2 TLs to G1 so they're free as Delegate for MBLD att2
AssignGroups(_333oh-r1,
             RoundOneAssignmentSets(_333oh, 2026-06-14),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay3(),
                    [ByFilters(CompetingIn(_333mbf), (StartTime() > 2026-06-14T16:00), -500),
                     ByFilters(And(BooleanProperty(TEAM_LEAD), (NumberProperty(STAFF_TEAM) == 2)), (StartTime() > 2026-06-14T16:00), -10000),
                     ByFilters(BooleanProperty("unoff-tb"), (StartTime() > 2026-06-14T16:00), -5000)]))
