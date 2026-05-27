#include "../lib/_assignment_sets.cs"
#include "../lib/_scorers.cs"

# 5x5 R1: June 12, 20:55-22:45 (3 rooms, 3 groups each)
# Adjacent: 7x7 R2 starts at 22:45 (only top 16 advance)
# Mirror R1 ends at 21:15 — push float T4 to G3 (last) so they're free for Mirror
# TLs distribute naturally (no push — previous scorer concentrated all in G2)
AssignGroups(_555-r1,
             RoundOneAssignmentSets(_555, 2026-06-12),
             Concat(DefaultScorers(),
                    StaffRoomScorersDay1(),
                    [ByFilters((NumberProperty(STAFF_TEAM) == 4), (EndTime() < 2026-06-12T22:30), -10000),
                     ByFilters(BooleanProperty("unoff-mirror"), (EndTime() < 2026-06-12T22:30), -5000)]))
