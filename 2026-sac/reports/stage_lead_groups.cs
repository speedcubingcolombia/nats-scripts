#include "../lib/_constants.cs"

# Grupos de Delegados — En qué grupo compite cada delegado
# Importante para verificar que cada grupo tenga supervisión delegada.
# Muestra los eventos más grandes (más grupos = más difícil de supervisar).

Define("TablaDeGruposDelegados",
       Table(
         Sort(Persons(And(BooleanProperty(STAGE_LEAD), CompetingInRound({1, Round}))),
              If(HasProperty(STAFF_TEAM), NumberProperty(STAFF_TEAM), 0)),
         [Column("Nombre", Name()),
          Column("Equipo", If(HasProperty(STAFF_TEAM), ToString(NumberProperty(STAFF_TEAM)), "���")),
          Column("Lead", BooleanProperty(TEAM_LEAD)),
          Column("Grupo", GroupName(AssignedGroup({1, Round}))),
          Column("Sala", Room(AssignedGroup({1, Round})))]))

Header("3x3 R1 — Delegados")
TablaDeGruposDelegados(_333-r1)

Header("2x2 R1 — Delegados")
TablaDeGruposDelegados(_222-r1)

Header("4x4 R1 — Delegados")
TablaDeGruposDelegados(_444-r1)

Header("Pyraminx R1 — Delegados")
TablaDeGruposDelegados(_pyram-r1)

Header("3x3 OH R1 — Delegados")
TablaDeGruposDelegados(_333oh-r1)
