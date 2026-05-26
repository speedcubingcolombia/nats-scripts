#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 3x3 R1: June 13, 20:10-22:20 (3 rooms, 6 groups each)
# Adjacent: Clock R3 at 22:20 (only 16 people), Minx R2 at 22:40
# MBLD att1 (21:10-22:20) overlaps — force T1 TLs to early groups
# Kilominx R1 (unofficial, D2) — push ALL float T1 to early groups
ManuallyAssign(Persons((WcaId() == "2017POPA01")), _333-r1, ZONA_ROJA, 1)
ManuallyAssign(Persons((WcaId() == "2017SOUZ14")), _333-r1, ZONA_ROJA, 1)
AssignGroups(_333-r1,
             RoundOneAssignmentSets(_333, 2026-06-13),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay2(),
                    [ByFilters(CompetingIn(_333mbf), (StartTime() > 2026-06-13T20:45), -10000),
                     ByFilters((NumberProperty(STAFF_TEAM) == 1), (StartTime() > 2026-06-13T21:00), -10000)]),
             overwrite=true)
