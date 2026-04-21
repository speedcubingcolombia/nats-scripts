#include "../../lib/_constants.cs"
#include "../../lib/_rooms.cs"
#include "_scorers.cs"

# SAC 2026 - Staff assignment helper (UDF wrapper)
# NOTE: NOT used by day*.cs — they use inline AssignStaff calls due to
# UDF limitations in Node.js runner. Kept for server-mode usage.
# Args: 1: Round, 2: Room name, 3: Jobs array
Define("DoStaffAssignments",
       AssignStaff(
         {1, Round},
         (Room() == {2, String}),
         Persons(Or(BooleanProperty(VOLUNTEER), BooleanProperty(STAGE_LEAD))),
         {3, Array<AssignmentJob>},
         [],
         overwrite=true))
