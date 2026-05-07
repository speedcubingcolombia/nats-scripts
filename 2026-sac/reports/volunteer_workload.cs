#include "../lib/_constants.cs"

# Workload — Jobs y horas por persona
# Ordenado por horas de trabajo (mayor a menor).
# Sirve para verificar que la carga esté balanceada entre el staff.

Header("Carga de trabajo del staff")
Table(
  Sort(Persons(Or(BooleanProperty(VOLUNTEER), BooleanProperty(LISTED_DELEGATE))), (0 - LengthOfJobs())),
  [Column("Nombre", Name()),
   Column("País", Country()),
   Column("Equipo", If(HasProperty(STAFF_TEAM), ToString(NumberProperty(STAFF_TEAM)), "—")),
   Column("Rol", If(BooleanProperty(TEAM_LEAD), "Lead", If(BooleanProperty(LISTED_DELEGATE), "Delegado", "Voluntario"))),
   Column("Eventos", Length(RegisteredEvents())),
   Column("Jobs de staff", NumJobs()),
   Column("Horas", LengthOfJobs())])
