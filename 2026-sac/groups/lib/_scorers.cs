#include "../../lib/_constants.cs"
#include "../../lib/_rooms.cs"

# SAC 2026 - Default scorers for group assignment optimization

# Country diversity: reward 2 from same country (+3), penalize clustering (-1).
# Spread sets across odd-numbered groups. Penalize back-to-back in same room.
Define("DefaultScorers",
       [ByMatchingValue(Country(), 3, limit=2),
        ByMatchingValue(Country(), -1),
        ByFilters(true, (Mod(GroupNumber(), 2) == 1), 1),
        ByFilters(true, (Mod(GroupNumber(), 4) == 1), 1),
        RecentlyCompeted(true, true, Min([((Arg<Number>() - 30) / 10), 0]))])

# Staff must compete in their team's assigned room.
# Floating team has no room constraint (can compete anywhere).
# Uses -500 penalty to strongly discourage wrong-room assignments.
#
# Day 1 (Jun 12): T1=Amarilla, T2=Azul, T3=Roja, T4=Flotante
Define("StaffRoomScorersDay1",
       [ByFilters(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 1)), Not((Room() == ZONA_AMARILLA)), -5000),
        ByFilters(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 2)), Not((Room() == ZONA_AZUL)), -5000),
        ByFilters(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 3)), Not((Room() == ZONA_ROJA)), -5000)])

# Day 2 (Jun 13): T2=Amarilla, T3=Azul, T4=Roja, T1=Flotante
Define("StaffRoomScorersDay2",
       [ByFilters(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 2)), Not((Room() == ZONA_AMARILLA)), -5000),
        ByFilters(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 3)), Not((Room() == ZONA_AZUL)), -5000),
        ByFilters(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 4)), Not((Room() == ZONA_ROJA)), -5000)])

# Day 3 (Jun 14): T3=Amarilla, T4=Azul, T1=Roja, T2=Flotante
Define("StaffRoomScorersDay3",
       [ByFilters(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 3)), Not((Room() == ZONA_AMARILLA)), -5000),
        ByFilters(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 4)), Not((Room() == ZONA_AZUL)), -5000),
        ByFilters(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 1)), Not((Room() == ZONA_ROJA)), -5000)])

# Day 4 (Jun 15): T4=Amarilla, T1=Azul, T2=Roja, T3=Flotante
Define("StaffRoomScorersDay4",
       [ByFilters(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 4)), Not((Room() == ZONA_AMARILLA)), -5000),
        ByFilters(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 1)), Not((Room() == ZONA_AZUL)), -5000),
        ByFilters(And(HasProperty(STAFF_TEAM), (NumberProperty(STAFF_TEAM) == 2)), Not((Room() == ZONA_ROJA)), -5000)])
