#include "../lib/_constants.cs"

# Lista de Personas — Para impresión de badges/credenciales
# Incluye todos los competidores y staff ordenados por apellido.

Header("Lista completa de personas")
Table(
  Sort(Persons(Or(Registered(), BooleanProperty(VOLUNTEER), BooleanProperty(STAGE_LEAD))), LastName()),
  [Column("Nombre", Name()),
   Column("WCA ID", If(IsNull(WcaId()), "—", WcaId())),
   Column("País", Country()),
   Column("Rol", If(BooleanProperty(TEAM_LEAD), "Team Lead", If(BooleanProperty(STAGE_LEAD), "Delegado", If(BooleanProperty(VOLUNTEER), "Voluntario", "Competidor")))),
   Column("Equipo", If(HasProperty(STAFF_TEAM), ToString(NumberProperty(STAFF_TEAM)), "—"))])
