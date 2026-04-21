#include "../../lib/_constants.cs"

# SAC 2026 - Staff assignment scorers (UDF wrapper)
# NOTE: NOT used by day*.cs — they hardcode scorers inline.
# Kept for server-mode usage.

Define("StaffScorers",
       [# Penalize assigning to the group right after competing (-50)
        FollowingGroupScorer(-50),
        # Prefer people who haven't worked recently
        JobCountScorer(-5),
        # Avoid same job twice in a row
        SameJobScorer(-10),
        # Avoid consecutive group assignments
        ConsecutiveJobScorer(-20)])
