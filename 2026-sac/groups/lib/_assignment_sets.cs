#include "../../lib/_constants.cs"
#include "../../lib/_rooms.cs"

# SAC 2026 - Assignment Sets
# 3 equal rooms (Amarilla, Azul, Roja), no Main/Side distinction.
# Competitors are distributed evenly across all rooms and groups.

# Round 1 assignment sets.
# Stage leads get assigned first to ensure even distribution,
# then all other competitors fill the remaining spots.
# Args:
# 1: Event
# 2: Date
Define("RoundOneAssignmentSets",
       [AssignmentSet("stage-leads",
                      And(BooleanProperty(STAGE_LEAD), CompetingIn({1, Event})),
                      true),
        AssignmentSet("volunteers",
                      And(BooleanProperty(VOLUNTEER), Not(BooleanProperty(STAGE_LEAD)), CompetingIn({1, Event})),
                      true),
        AssignmentSet("competitors",
                      CompetingIn({1, Event}),
                      true)])

# Semifinal assignment sets (R2).
# Distribute based on previous round position for balanced competition.
# Args:
# 1: Round
Define("SemifinalAssignmentSets",
       [AssignmentSet("top",
                      (RoundPosition(PreviousRound({1, Round})) <= 8),
                      true,
                      featured=true),
        AssignmentSet("rest",
                      true,
                      true)])

# Final assignment sets (R3/R4 with 16 competitors).
# Even/odd split across 2 rooms for balanced finals.
# Args:
# 1: Round
Define("FinalAssignmentSets",
       [AssignmentSet("evens",
                      Even(RoundPosition(PreviousRound({1, Round}))),
                      (Room() == ZONA_AMARILLA)),
        AssignmentSet("odds",
                      Not(Even(RoundPosition(PreviousRound({1, Round})))),
                      (Room() == ZONA_AZUL))])
