#include "../lib/_constants.cs"
#include "../lib/_assigned_room.cs"

# Equipos de Staff — Miembros, roles y rotación de salas
# Cada equipo rota diariamente entre las 3 zonas principales.
# Un equipo es flotante por día (cubre BLD + no oficiales + apoyo).

"Rotación de salas:"
"Jun 12: T1=Amarilla, T2=Azul, T3=Roja, T4=Flotante"
"Jun 13: T2=Amarilla, T3=Azul, T4=Roja, T1=Flotante"
"Jun 14: T3=Amarilla, T4=Azul, T1=Roja, T2=Flotante"
"Jun 15: T4=Amarilla, T1=Azul, T2=Roja, T3=Flotante"

Header("Equipo 1 — 25 miembros")
Table(
  Sort(Persons(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 1))), If(BooleanProperty(TEAM_LEAD), 0, If(BooleanProperty(STAGE_LEAD), 1, 2))),
  [Column("Nombre", Name()),
   Column("WCA ID", If(IsNull(WcaId()), "—", WcaId())),
   Column("País", Country()),
   Column("Rol", If(BooleanProperty(TEAM_LEAD), "Team Lead", If(BooleanProperty(STAGE_LEAD), "Delegado", "Voluntario")))])

Header("Equipo 2 — 24 miembros")
Table(
  Sort(Persons(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 2))), If(BooleanProperty(TEAM_LEAD), 0, If(BooleanProperty(STAGE_LEAD), 1, 2))),
  [Column("Nombre", Name()),
   Column("WCA ID", If(IsNull(WcaId()), "—", WcaId())),
   Column("País", Country()),
   Column("Rol", If(BooleanProperty(TEAM_LEAD), "Team Lead", If(BooleanProperty(STAGE_LEAD), "Delegado", "Voluntario")))])

Header("Equipo 3 — 24 miembros")
Table(
  Sort(Persons(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 3))), If(BooleanProperty(TEAM_LEAD), 0, If(BooleanProperty(STAGE_LEAD), 1, 2))),
  [Column("Nombre", Name()),
   Column("WCA ID", If(IsNull(WcaId()), "—", WcaId())),
   Column("País", Country()),
   Column("Rol", If(BooleanProperty(TEAM_LEAD), "Team Lead", If(BooleanProperty(STAGE_LEAD), "Delegado", "Voluntario")))])

Header("Equipo 4 — 24 miembros")
Table(
  Sort(Persons(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 4))), If(BooleanProperty(TEAM_LEAD), 0, If(BooleanProperty(STAGE_LEAD), 1, 2))),
  [Column("Nombre", Name()),
   Column("WCA ID", If(IsNull(WcaId()), "—", WcaId())),
   Column("País", Country()),
   Column("Rol", If(BooleanProperty(TEAM_LEAD), "Team Lead", If(BooleanProperty(STAGE_LEAD), "Delegado", "Voluntario")))])
