#include "_constants.cs"

# SAC 2026 - Team to Room mapping per day
# 4 equipos rotan: 3 en salas principales + 1 flotante (BLD + no oficiales + apoyo)
# Cada equipo es flotante exactamente 1 día.
#
# Día 1 (Jun 12): T1=Amarilla, T2=Azul, T3=Roja, T4=Flotante
# Día 2 (Jun 13): T2=Amarilla, T3=Azul, T4=Roja, T1=Flotante
# Día 3 (Jun 14): T3=Amarilla, T4=Azul, T1=Roja, T2=Flotante
# Día 4 (Jun 15): T4=Amarilla, T1=Azul, T2=Roja, T3=Flotante

#define ZONA_AMARILLA "Zona Amarilla"
#define ZONA_AZUL "Zona Azul"
#define ZONA_ROJA "Zona Roja"
#define SALA_BLD "Zona Morada (Sala BLD)"
#define FLOTANTE "Flotante (BLD + No oficial + Apoyo)"

Define("AssignedRoomForTeam",
       If(({1, Number} == 1),
          If(({2, Date} == 2026-06-12), ZONA_AMARILLA,
             If(({2, Date} == 2026-06-13), FLOTANTE,
                If(({2, Date} == 2026-06-14), ZONA_ROJA, ZONA_AZUL))),
          If(({1, Number} == 2),
             If(({2, Date} == 2026-06-12), ZONA_AZUL,
                If(({2, Date} == 2026-06-13), ZONA_AMARILLA,
                   If(({2, Date} == 2026-06-14), FLOTANTE, ZONA_ROJA))),
             If(({1, Number} == 3),
                If(({2, Date} == 2026-06-12), ZONA_ROJA,
                   If(({2, Date} == 2026-06-13), ZONA_AZUL,
                      If(({2, Date} == 2026-06-14), ZONA_AMARILLA, FLOTANTE))),
                If(({2, Date} == 2026-06-12), FLOTANTE,
                   If(({2, Date} == 2026-06-13), ZONA_ROJA,
                      If(({2, Date} == 2026-06-14), ZONA_AZUL, ZONA_AMARILLA)))))))

Define("AssignedRoom",
       If(HasProperty(STAFF_TEAM),
          AssignedRoomForTeam(NumberProperty(STAFF_TEAM), {2, Date}),
          "n/a"))
