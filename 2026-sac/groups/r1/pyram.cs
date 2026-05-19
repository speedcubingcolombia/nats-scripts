#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# Pyraminx R1: June 14, 20:30-22:10 (3 rooms, 5 groups each)
# Adjacent: 3x3 R2 starts at 22:10
# Force T2 TLs to G5 so they're free for 444bf (20:00-20:50)
ManuallyAssign(Persons((WcaId() == [2017PINT05])), _pyram-r1, ZONA_ROJA, 5)
ManuallyAssign(Persons((WcaId() == [2014YUNO01])), _pyram-r1, ZONA_AZUL, 5)
AssignGroups(_pyram-r1,
             RoundOneAssignmentSets(_pyram, 2026-06-14),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay3(),
                    [ByFilters(CompetingIn(_333), (EndTime() > 2026-06-14T21:55), -100),
                     ByFilters(CompetingIn(_444bf), (EndTime() < 2026-06-14T21:30), -10000)]))
