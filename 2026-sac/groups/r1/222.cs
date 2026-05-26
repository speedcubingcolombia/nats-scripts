#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 2x2 R1: June 14, 18:40-20:30 (3 rooms, 5 groups each)
# Adjacent: Pyraminx R1 starts at 20:30
# Force T2 TLs to G1 so they're free for 444bf (20:00-20:50)
# FTO/TB R1 (unofficial, D3 19:00+) — push ALL float T2 to G1
ManuallyAssign(Persons((WcaId() == "2014IBAR01")), _222-r1, ZONA_AMARILLA, 1)
ManuallyAssign(Persons((WcaId() == "2017PINT05")), _222-r1, ZONA_ROJA, 1)
ManuallyAssign(Persons((WcaId() == "2014YUNO01")), _222-r1, ZONA_AZUL, 1)
AssignGroups(_222-r1,
             RoundOneAssignmentSets(_222, 2026-06-14),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay3(),
                    [ByFilters(CompetingIn(_pyram), (EndTime() > 2026-06-14T20:15), -100),
                     ByFilters(CompetingIn(_444bf), (StartTime() > 2026-06-14T19:30), -10000),
                     ByFilters((NumberProperty(STAFF_TEAM) == 2), (StartTime() > 2026-06-14T18:55), -10000),
                     ByFilters(BooleanProperty("unoff-fto"), (StartTime() > 2026-06-14T18:55), -5000)]),
             overwrite=true)
