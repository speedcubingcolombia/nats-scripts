#include "../../lib/_constants.cs"

# SAC 2026 - Job definitions for staff assignments
# NOTE: These UDFs are NOT used by day*.cs (they use inline AssignStaff calls).
# Kept as reference for future refactoring or server-mode usage.

Define("Judges", Job("judge", {1, Number},
                     eligibility=And(Not(BooleanProperty(STAGE_LEAD)),
                                     Or(BooleanProperty(VOLUNTEER),
                                        (RegistrationStatus() == "accepted")))))

Define("Scramblers", Job("scrambler", {1, Number},
                         eligibility=And(Not(BooleanProperty(STAGE_LEAD)),
                                         BooleanProperty(VOLUNTEER))))

Define("Runners", Job("runner", {1, Number},
                      eligibility=And(Not(BooleanProperty(STAGE_LEAD)),
                                      BooleanProperty(VOLUNTEER))))

Define("Delegates", Job("Delegate", {1, Number},
                        eligibility=BooleanProperty(STAGE_LEAD)))
