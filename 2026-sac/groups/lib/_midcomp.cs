#include "_assignment_sets.cs"
#include "_scorers.cs"

# SAC 2026 - Midcomp helpers for semifinals and finals

# Standard semifinal assignment
# Args: 1: Round
Define("AssignSemifinals",
       AssignGroups({1, Round}, SemifinalAssignmentSets({1, Round}), DefaultScorers()))

# Standard final assignment (2 rooms, even/odd split)
# Args: 1: Round
Define("AssignFinals",
       AssignGroups({1, Round}, FinalAssignmentSets({1, Round}), []))
