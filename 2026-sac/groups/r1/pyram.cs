#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# Pyraminx R1: June 14, 20:30-22:10 (3 rooms, 5 groups each)
ManuallyAssign(Persons((WcaId() == "2017PINT05")), _pyram-r1, ZONA_ROJA, 5)
ManuallyAssign(Persons((WcaId() == "2014YUNO01")), _pyram-r1, ZONA_AZUL, 5)
AssignGroups(_pyram-r1,
             RoundOneAssignmentSets(_pyram, 2026-06-14),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay3(),
                    [ByFilters(CompetingIn(_333), (EndTime() > 2026-06-14T21:55), -100),
                     ByFilters(CompetingIn(_444bf), (EndTime() < 2026-06-14T21:30), -10000),
                     ByFilters((NumberProperty(STAFF_TEAM) == 2), (EndTime() < 2026-06-14T21:50), -10000),
                     ByFilters(BooleanProperty("unofficial_lead"), (EndTime() < 2026-06-14T22:00), -10000),
                     ByFilters(BooleanProperty("unoff-fto"), (EndTime() < 2026-06-14T22:00), -5000),
                     ByFilters(BooleanProperty("force-g1-pyram"), Not((GroupNumber() == 1)), -200000),
                     ByFilters(BooleanProperty("force-g2-pyram"), Not((GroupNumber() == 2)), -200000),
                     ByFilters(BooleanProperty("force-g3-pyram"), Not((GroupNumber() == 3)), -200000),
                     ByFilters(BooleanProperty("force-g4-pyram"), Not((GroupNumber() == 4)), -200000),
                     ByFilters(BooleanProperty("force-g5-pyram"), Not((GroupNumber() == 5)), -200000)]),
             overwrite=true)
