#include "../lib/_constants.cs"

# Team Zone Rotation

Header("Team 1")
"Day 1 (Jun 12): Zona Amarilla"
"Day 2 (Jun 13): FLOATING — BLD (555bf, MBLD) + Unofficial (Kilominx)"
"Day 3 (Jun 14): Zona Roja"
"Day 4 (Jun 15): Zona Azul"
Length(Persons((NumberProperty(STAFF_TEAM) == 1)))

Header("Team 2")
"Day 1 (Jun 12): Zona Azul"
"Day 2 (Jun 13): Zona Amarilla"
"Day 3 (Jun 14): FLOATING — BLD (444bf, MBLD) + Unofficial (FTO, TB, Mirror F, Kilo F)"
"Day 4 (Jun 15): Zona Roja"
Length(Persons((NumberProperty(STAFF_TEAM) == 2)))

Header("Team 3")
"Day 1 (Jun 12): Zona Roja"
"Day 2 (Jun 13): Zona Azul"
"Day 3 (Jun 14): Zona Amarilla"
"Day 4 (Jun 15): FLOATING — Unofficial (FTO Final, TB Final)"
Length(Persons((NumberProperty(STAFF_TEAM) == 3)))

Header("Team 4")
"Day 1 (Jun 12): FLOATING — Unofficial (Mirror R1)"
"Day 2 (Jun 13): Zona Roja"
"Day 3 (Jun 14): Zona Azul"
"Day 4 (Jun 15): Zona Amarilla"
Length(Persons((NumberProperty(STAFF_TEAM) == 4)))
