#include "../lib/_constants.cs"

# Staff Summary — Conteos por rol, rango y país

Header("Conteos generales")
"Total staff (voluntarios + delegados)"
Length(Persons(Or(BooleanProperty(VOLUNTEER), BooleanProperty(LISTED_DELEGATE))))
"Delegados (stage leads)"
Length(Persons(BooleanProperty(LISTED_DELEGATE)))
"Voluntarios (no delegados)"
Length(Persons(And(BooleanProperty(VOLUNTEER), Not(BooleanProperty(LISTED_DELEGATE)))))
"Team leads"
Length(Persons(BooleanProperty(TEAM_LEAD)))
"Competidores registrados"
Length(Persons(Registered()))

Header("Delegados por rango")
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

Header("Delegados — detalle")
Table(
  Sort(Persons(BooleanProperty(LISTED_DELEGATE)), Country()),
  [Column("Nombre", Name()),
   Column("País", Country()),
   Column("Rango", StringProperty(DELEGATE_RANK)),
   Column("Equipo", If(HasProperty(STAFF_TEAM), ToString(NumberProperty(STAFF_TEAM)), "—")),
   Column("Team Lead", BooleanProperty(TEAM_LEAD))])
