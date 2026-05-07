#include "../lib/_constants.cs"
#include "../lib/_assigned_room.cs"

# Staff Teams — Members, roles, and room rotation
# Teams rotate daily across the 3 main zones.
# One team is floating per day (covers BLD + unofficial + support).

"Room rotation:"
"Jun 12: T1=Amarilla, T2=Azul, T3=Roja, T4=Floating"
"Jun 13: T2=Amarilla, T3=Azul, T4=Roja, T1=Floating"
"Jun 14: T3=Amarilla, T4=Azul, T1=Roja, T2=Floating"
"Jun 15: T4=Amarilla, T1=Azul, T2=Roja, T3=Floating"

Header("Team 1")
Length(Persons(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 1))))
Table(
  Sort(Persons(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 1))), If(BooleanProperty(TEAM_LEAD), 0, If(BooleanProperty(LISTED_DELEGATE), 1, 2))),
  [Column("Name", Name()),
   Column("Country", Country()),
   Column("Role", If(BooleanProperty(TEAM_LEAD), "Team Lead", If(BooleanProperty("score-taker"), "Score Taker", If(BooleanProperty(LISTED_DELEGATE), "Delegate", "Volunteer"))))])

Header("Team 2")
Length(Persons(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 2))))
Table(
  Sort(Persons(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 2))), If(BooleanProperty(TEAM_LEAD), 0, If(BooleanProperty(LISTED_DELEGATE), 1, 2))),
  [Column("Name", Name()),
   Column("Country", Country()),
   Column("Role", If(BooleanProperty(TEAM_LEAD), "Team Lead", If(BooleanProperty("score-taker"), "Score Taker", If(BooleanProperty(LISTED_DELEGATE), "Delegate", "Volunteer"))))])

Header("Team 3")
Length(Persons(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 3))))
Table(
  Sort(Persons(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 3))), If(BooleanProperty(TEAM_LEAD), 0, If(BooleanProperty(LISTED_DELEGATE), 1, 2))),
  [Column("Name", Name()),
   Column("Country", Country()),
   Column("Role", If(BooleanProperty(TEAM_LEAD), "Team Lead", If(BooleanProperty("score-taker"), "Score Taker", If(BooleanProperty(LISTED_DELEGATE), "Delegate", "Volunteer"))))])

Header("Team 4")
Length(Persons(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 4))))
Table(
  Sort(Persons(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 4))), If(BooleanProperty(TEAM_LEAD), 0, If(BooleanProperty(LISTED_DELEGATE), 1, 2))),
  [Column("Name", Name()),
   Column("Country", Country()),
   Column("Role", If(BooleanProperty(TEAM_LEAD), "Team Lead", If(BooleanProperty("score-taker"), "Score Taker", If(BooleanProperty(LISTED_DELEGATE), "Delegate", "Volunteer"))))])

Header("Score Takers (Data Entry)")
Table(
  Persons((StringProperty("special-role") == "Score Taker")),
  [Column("Name", Name()),
   Column("Country", Country())])

Header("Streaming")
Table(
  Persons(BooleanProperty("streaming")),
  [Column("Name", Name()),
   Column("Country", Country())])

Header("Organizers")
Table(
  Persons((StringProperty("special-role") == "Organizer")),
  [Column("Name", Name()),
   Column("Country", Country())])

Header("Other Roles")
Table(
  Persons(And(HasProperty("special-role"), Not((StringProperty("special-role") == "Score Taker")), Not((StringProperty("special-role") == "Organizer")))),
  [Column("Name", Name()),
   Column("Country", Country()),
   Column("Role", StringProperty("special-role"))])
