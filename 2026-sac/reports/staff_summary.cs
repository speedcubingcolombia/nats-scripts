#include "../lib/_constants.cs"

# Staff Summary — Counts by role, rank, and country

Header("General Counts")
"Total staff (volunteers + delegates)"
Length(Persons(Or(BooleanProperty(VOLUNTEER), BooleanProperty(LISTED_DELEGATE))))
"Delegates (listed)"
Length(Persons(BooleanProperty(LISTED_DELEGATE)))
"Volunteers (non-delegate)"
Length(Persons(And(BooleanProperty(VOLUNTEER), Not(BooleanProperty(LISTED_DELEGATE)))))
"Team Leads"
Length(Persons(BooleanProperty(TEAM_LEAD)))
"Score Takers"
Length(Persons(BooleanProperty("score-taker")))
"Registered competitors"
Length(Persons(Registered()))

Header("Delegates by Rank")
"Full"
Length(Persons((StringProperty(DELEGATE_RANK) == "full")))
"Senior"
Length(Persons((StringProperty(DELEGATE_RANK) == "senior")))
"Regional"
Length(Persons((StringProperty(DELEGATE_RANK) == "regional")))
"Junior"
Length(Persons((StringProperty(DELEGATE_RANK) == "junior")))
"Trainee"
Length(Persons((StringProperty(DELEGATE_RANK) == "trainee")))

Header("Delegates — Detail")
Table(
  Sort(Persons(BooleanProperty(LISTED_DELEGATE)), Country()),
  [Column("Name", Name()),
   Column("Country", Country()),
   Column("Rank", StringProperty(DELEGATE_RANK)),
   Column("Team", If(HasProperty(STAFF_TEAM), ToString(NumberProperty(STAFF_TEAM)), "—")),
   Column("Team Lead", BooleanProperty(TEAM_LEAD))])

Header("Unofficial Events Lead")
Table(
  Persons(BooleanProperty("unofficial_lead")),
  [Column("Name", Name()),
   Column("Country", Country()),
   Column("Role", "Unofficial Events Lead (Zona Verde)")])

Header("Score Takers (Data Entry)")
Table(
  Persons(BooleanProperty("score-taker")),
  [Column("Name", Name()),
   Column("Country", Country())])

Header("Streaming")
Table(
  Persons(BooleanProperty("streaming")),
  [Column("Name", Name()),
   Column("Country", Country())])
