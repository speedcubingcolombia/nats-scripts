#include "../lib/_constants.cs"

# Personal Schedule — Staff assignments per person per day

Header("Team 1")
Table(
  Sort(Persons((NumberProperty(STAFF_TEAM) == 1)), Name()),
  [Column("Name", Name()),
   Column("Role", If(BooleanProperty(TEAM_LEAD), "TL", If(BooleanProperty(LISTED_DELEGATE), "Del", "Vol"))),
   Column("Events", Length(RegisteredEvents())),
   Column("Total Jobs", NumJobs())])

Header("Team 2")
Table(
  Sort(Persons((NumberProperty(STAFF_TEAM) == 2)), Name()),
  [Column("Name", Name()),
   Column("Role", If(BooleanProperty(TEAM_LEAD), "TL", If(BooleanProperty(LISTED_DELEGATE), "Del", "Vol"))),
   Column("Events", Length(RegisteredEvents())),
   Column("Total Jobs", NumJobs())])

Header("Team 3")
Table(
  Sort(Persons((NumberProperty(STAFF_TEAM) == 3)), Name()),
  [Column("Name", Name()),
   Column("Role", If(BooleanProperty(TEAM_LEAD), "TL", If(BooleanProperty(LISTED_DELEGATE), "Del", "Vol"))),
   Column("Events", Length(RegisteredEvents())),
   Column("Total Jobs", NumJobs())])

Header("Team 4")
Table(
  Sort(Persons((NumberProperty(STAFF_TEAM) == 4)), Name()),
  [Column("Name", Name()),
   Column("Role", If(BooleanProperty(TEAM_LEAD), "TL", If(BooleanProperty(LISTED_DELEGATE), "Del", "Vol"))),
   Column("Events", Length(RegisteredEvents())),
   Column("Total Jobs", NumJobs())])
