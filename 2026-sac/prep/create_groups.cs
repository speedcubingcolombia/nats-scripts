#include "../lib/_constants.cs"
#include "../lib/_rooms.cs"
#include "../lib/_group_counts.cs"

# ============================================================
# SAC 2026 - Create group activities in the schedule
# ============================================================
# Creates child activities (groups) for every round in every room.
# Must be run BEFORE any group assignment scripts.
# This is NOT idempotent — only run once (or clear cache first).

# =====================
# Day 1 - June 12
# =====================

# 7x7 Round 1 (3 rooms, 2 groups each)
Map(AllRooms(), CreateGroups(_777-r1, GROUPS_777, 2026-06-12T13:15, 2026-06-12T14:45))

# 6x6 Round 1 (3 rooms, 2 groups each)
Map(AllRooms(), CreateGroups(_666-r1, GROUPS_666, 2026-06-12T14:45, 2026-06-12T16:05))

# Megaminx Round 1 (3 rooms, 3 groups each)
Map(AllRooms(), CreateGroups(_minx-r1, GROUPS_MINX, 2026-06-12T16:05, 2026-06-12T17:45))

# Square-1 Round 1 (3 rooms, 2 groups each)
Map(AllRooms(), CreateGroups(_sq1-r1, GROUPS_SQ1, 2026-06-12T18:45, 2026-06-12T19:45))

# Clock Round 1 (3 rooms, 3 groups each)
Map(AllRooms(), CreateGroups(_clock-r1, GROUPS_CLOCK, 2026-06-12T19:45, 2026-06-12T20:55))

# 5x5 Round 1 (3 rooms, 3 groups each)
Map(AllRooms(), CreateGroups(_555-r1, GROUPS_555, 2026-06-12T20:55, 2026-06-12T22:45))

# 7x7 Round 2 (2 rooms, 1 group each)
CreateGroups(_777-r2, 1, ZONA_AMARILLA, 2026-06-12T22:45, 2026-06-12T23:15)
CreateGroups(_777-r2, 1, ZONA_AZUL, 2026-06-12T22:45, 2026-06-12T23:15)

# 6x6 Round 2 (2 rooms, 1 group each)
CreateGroups(_666-r2, 1, ZONA_AMARILLA, 2026-06-12T23:15, 2026-06-12T23:45)
CreateGroups(_666-r2, 1, ZONA_AZUL, 2026-06-12T23:15, 2026-06-12T23:45)

# Square-1 Round 2 (2 rooms, 1 group each)
CreateGroups(_sq1-r2, 1, ZONA_AMARILLA, 2026-06-12T23:45, 2026-06-13T00:05)
CreateGroups(_sq1-r2, 1, ZONA_AZUL, 2026-06-12T23:45, 2026-06-13T00:05)

# =====================
# Day 2 - June 13
# =====================

# Clock Round 2 (3 rooms, 2 groups each)
Map(AllRooms(), CreateGroups(_clock-r2, 2, 2026-06-13T13:15, 2026-06-13T14:00))

# 4x4 Round 1 (3 rooms, 4 groups each)
Map(AllRooms(), CreateGroups(_444-r1, GROUPS_444, 2026-06-13T14:00, 2026-06-13T16:10))

# Skewb Round 1 (3 rooms, 3 groups each)
Map(AllRooms(), CreateGroups(_skewb-r1, GROUPS_SKEWB, 2026-06-13T16:10, 2026-06-13T17:30))

# 5x5 Round 2 (2 rooms, 1 group each)
CreateGroups(_555-r2, 1, ZONA_AMARILLA, 2026-06-13T17:30, 2026-06-13T17:55)
CreateGroups(_555-r2, 1, ZONA_AZUL, 2026-06-13T17:30, 2026-06-13T17:55)

# 5x5 BLD (BLD room, 1 group)
CreateGroups(_555bf-r1, 1, SALA_BLD, 2026-06-13T15:00, 2026-06-13T16:10, useStageName=false)

# 3x3 Round 1 (3 rooms, 6 groups each)
Map(AllRooms(), CreateGroups(_333-r1, GROUPS_333, 2026-06-13T20:10, 2026-06-13T22:20))

# 3x3 Multi-BLD Attempt 1 (BLD room, 1 group)
CreateGroups(_333mbf-r1-a1, 1, SALA_BLD, 2026-06-13T21:10, 2026-06-13T22:20, useStageName=false)

# Clock Round 3 / Final (2 rooms, 1 group each)
CreateGroups(_clock-r3, 1, ZONA_AMARILLA, 2026-06-13T22:20, 2026-06-13T22:40)
CreateGroups(_clock-r3, 1, ZONA_AZUL, 2026-06-13T22:20, 2026-06-13T22:40)

# Megaminx Round 2 (2 rooms, 2 groups each)
CreateGroups(_minx-r2, 2, ZONA_AMARILLA, 2026-06-13T22:40, 2026-06-13T23:40)
CreateGroups(_minx-r2, 2, ZONA_AZUL, 2026-06-13T22:40, 2026-06-13T23:40)

# =====================
# Day 3 - June 14
# =====================

# 3x3 BLD Round 1 (3 rooms, 3 groups each)
Map(AllRooms(), CreateGroups(_333bf-r1, GROUPS_333BF, 2026-06-14T13:15, 2026-06-14T14:15))

# 4x4 Round 2 (3 rooms, 2 groups each)
Map(AllRooms(), CreateGroups(_444-r2, 2, 2026-06-14T14:15, 2026-06-14T15:15))

# Megaminx Round 3 / Final (2 rooms, 1 group each)
CreateGroups(_minx-r3, 1, ZONA_AMARILLA, 2026-06-14T15:15, 2026-06-14T15:40)
CreateGroups(_minx-r3, 1, ZONA_AZUL, 2026-06-14T15:15, 2026-06-14T15:40)

# 3x3 OH Round 1 (3 rooms, 3 groups each)
Map(AllRooms(), CreateGroups(_333oh-r1, GROUPS_333OH, 2026-06-14T15:40, 2026-06-14T17:25))

# 3x3 Multi-BLD Attempt 2 (BLD room, 1 group)
CreateGroups(_333mbf-r1-a2, 1, SALA_BLD, 2026-06-14T16:15, 2026-06-14T17:25, useStageName=false)

# 2x2 Round 1 (3 rooms, 5 groups each)
Map(AllRooms(), CreateGroups(_222-r1, GROUPS_222, 2026-06-14T18:40, 2026-06-14T20:30))

# 4x4 BLD (BLD room, 1 group)
CreateGroups(_444bf-r1, 1, SALA_BLD, 2026-06-14T20:00, 2026-06-14T20:50, useStageName=false)

# Pyraminx Round 1 (3 rooms, 5 groups each)
Map(AllRooms(), CreateGroups(_pyram-r1, GROUPS_PYRAM, 2026-06-14T20:30, 2026-06-14T22:10))

# 3x3 Round 2 (3 rooms, 4 groups each)
Map(AllRooms(), CreateGroups(_333-r2, 4, 2026-06-14T22:10, 2026-06-14T23:20))

# =====================
# Day 4 - June 15
# =====================

# 3x3 OH Round 2 (3 rooms, 2 groups each)
Map(AllRooms(), CreateGroups(_333oh-r2, 2, 2026-06-15T13:15, 2026-06-15T14:15))

# Pyraminx Round 2 (3 rooms, 2 groups each)
Map(AllRooms(), CreateGroups(_pyram-r2, 2, 2026-06-15T14:15, 2026-06-15T15:05))

# 2x2 Round 2 (3 rooms, 2 groups each)
Map(AllRooms(), CreateGroups(_222-r2, 2, 2026-06-15T15:05, 2026-06-15T15:55))

# Skewb Round 2 (3 rooms, 2 groups each)
Map(AllRooms(), CreateGroups(_skewb-r2, 2, 2026-06-15T15:55, 2026-06-15T16:45))

# 3x3 Round 3 (3 rooms, 2 groups each)
Map(AllRooms(), CreateGroups(_333-r3, 2, 2026-06-15T16:45, 2026-06-15T17:25))

# Skewb Round 3 / Final (2 rooms, 1 group each)
CreateGroups(_skewb-r3, 1, ZONA_AMARILLA, 2026-06-15T18:40, 2026-06-15T19:00)
CreateGroups(_skewb-r3, 1, ZONA_AZUL, 2026-06-15T18:40, 2026-06-15T19:00)

# 4x4 Round 3 / Final (2 rooms, 1 group each)
CreateGroups(_444-r3, 1, ZONA_AMARILLA, 2026-06-15T19:00, 2026-06-15T19:35)
CreateGroups(_444-r3, 1, ZONA_AZUL, 2026-06-15T19:00, 2026-06-15T19:35)

# Pyraminx Round 3 / Final (2 rooms, 1 group each)
CreateGroups(_pyram-r3, 1, ZONA_AMARILLA, 2026-06-15T19:35, 2026-06-15T19:55)
CreateGroups(_pyram-r3, 1, ZONA_AZUL, 2026-06-15T19:35, 2026-06-15T19:55)

# 3x3 BLD Round 2 / Final (2 rooms, 1 group each)
CreateGroups(_333bf-r2, 1, ZONA_AMARILLA, 2026-06-15T19:55, 2026-06-15T20:20)
CreateGroups(_333bf-r2, 1, ZONA_AZUL, 2026-06-15T19:55, 2026-06-15T20:20)

# 2x2 Round 3 / Final (2 rooms, 1 group each)
CreateGroups(_222-r3, 1, ZONA_AMARILLA, 2026-06-15T20:20, 2026-06-15T20:40)
CreateGroups(_222-r3, 1, ZONA_AZUL, 2026-06-15T20:20, 2026-06-15T20:40)

# 3x3 OH Round 3 / Final (2 rooms, 1 group each)
CreateGroups(_333oh-r3, 1, ZONA_AMARILLA, 2026-06-15T20:40, 2026-06-15T21:05)
CreateGroups(_333oh-r3, 1, ZONA_AZUL, 2026-06-15T20:40, 2026-06-15T21:05)

# 3x3 Round 4 / Grand Final (1 room)
CreateGroups(_333-r4, 1, ZONA_AZUL, 2026-06-15T21:05, 2026-06-15T22:35)
