#include "../lib/_constants.cs"

# Workload — Staff job count per person
# Sorted by number of jobs (highest first).
# Use to verify workload is balanced across staff.

Header("Staff Workload")
Table(
  Sort(Persons(Or(BooleanProperty(VOLUNTEER), BooleanProperty(LISTED_DELEGATE))), (0 - NumJobs())),
  [Column("Name", Name()),
   Column("Country", Country()),
   Column("Team", If(HasProperty(STAFF_TEAM), ToString(NumberProperty(STAFF_TEAM)), "—")),
   Column("Role", If(BooleanProperty(TEAM_LEAD), "TL", If(BooleanProperty("score-taker"), "ST", If(BooleanProperty(LISTED_DELEGATE), "Delegate", "Volunteer")))),
   Column("Events", Length(RegisteredEvents())),
   Column("Staff Jobs", NumJobs())])
