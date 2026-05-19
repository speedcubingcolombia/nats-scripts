#include "../lib/_constants.cs"

# Team Leads — 12 TLs, 3 per team

Header("Team 1")
Table(
  Persons(And(BooleanProperty(TEAM_LEAD), (NumberProperty(STAFF_TEAM) == 1))),
  [Column("Name", Name()),
   Column("Country", Country()),
   Column("Rank", StringProperty(DELEGATE_RANK)),
   Column("Events", Length(RegisteredEvents()))])

Header("Team 2")
Table(
  Persons(And(BooleanProperty(TEAM_LEAD), (NumberProperty(STAFF_TEAM) == 2))),
  [Column("Name", Name()),
   Column("Country", Country()),
   Column("Rank", StringProperty(DELEGATE_RANK)),
   Column("Events", Length(RegisteredEvents()))])

Header("Team 3")
Table(
  Persons(And(BooleanProperty(TEAM_LEAD), (NumberProperty(STAFF_TEAM) == 3))),
  [Column("Name", Name()),
   Column("Country", Country()),
   Column("Rank", StringProperty(DELEGATE_RANK)),
   Column("Events", Length(RegisteredEvents()))])

Header("Team 4")
Table(
  Persons(And(BooleanProperty(TEAM_LEAD), (NumberProperty(STAFF_TEAM) == 4))),
  [Column("Name", Name()),
   Column("Country", Country()),
   Column("Rank", StringProperty(DELEGATE_RANK)),
   Column("Events", Length(RegisteredEvents()))])
