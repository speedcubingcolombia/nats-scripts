#include "../lib/_constants.cs"

# SAC 2026 - Handle people without WCA IDs o no registrados oficialmente

# Angie Casallas (wcaUserId=520057): registered competitor, NOT staff.

# Felipe Andres Rojas Garces (2009GARC02, CL, wcaUserId=273): not officially registered
# but will help as staff. Added as non-competing staff
# via AddPerson → appears in WCIF with registrantId null until PATCH to
# WCA portal. Full Delegate; NOT Team Lead per delegate coordinator (2026-05-05).
AddPerson(273, "Felipe Andres Rojas Garces")
SetProperty([p273], VOLUNTEER, true)
SetProperty([p273], LISTED_DELEGATE, true)
SetProperty([p273], DELEGATE_RANK, "full")

# Juliana García Uribe (2025URIB01, CO, wcaUserId=474926): registered as Volunteer
# pero comp registration was rejected (Status='b'). Reactivated as staff vía
# AddPerson per delegate coordinator (2026-05-05). Volunteer (not delegate).
AddPerson(474926, "Juliana García Uribe")
SetProperty([p474926], VOLUNTEER, true)

# --- Volunteers aprobados de "voluntarios listado.xlsx" but rejected or
#     not present in SAC2026-registration.xlsx (need AddPerson) ---
# Confirmed as staff by delegate coordinator 2026-05-05.
# With WCA ID — wcaUserId obtained via WCA portal API:
AddPerson(10189, "José Libardo Moreno Rodríguez")
AddPerson(253544, "Cristian Camilo Bonilla Lizarazo")
AddPerson(440824, "Johana Suarez")
AddPerson(466563, "Carlos Beltran")
AddPerson(484326, "Juliana Cárdenas")
AddPerson(476324, "Zaray Dayana Barragán Delgado")
AddPerson(482456, "Marcela Ballén Fandiño")
AddPerson(501409, "Fredy Antonio Estupiñán Mongui")
AddPerson(501618, "Tomas Felipe Pinzon Rojas")
# Laura Fandiño (wcaUserId=541873): non-competing staff, mother of Marcela Ballén
# Fandiño (2025FAND01). Added 2026-06-05, pinned to T4 with her daughter.
AddPerson(541873, "Laura Fandiño")
# Without WCA ID — wcaUserId obtained via WCA portal API:
AddPerson(474236, "Ana Milena Quintero Díaz")
AddPerson(508852, "Danilo Montero")
AddPerson(510444, "Marcela Ortiz")
# Angie Juliett (wcaUserId 542051): non-competing, dedicated support for Maarten in
# ALL unofficial events (Zona Verde / Tarima). OUT of the team pool (no staff-team),
# like Maarten. Assigned to every unofficial block as co-Lead in Phase 3.8. Added 2026-06-06.
AddPerson(542051, "Angie Juliett")
SetProperty([p542051], "unofficial_support", true)
SetProperty([p10189, p253544, p440824, p466563, p484326, p476324, p482456, p501409, p501618, p541873, p474236, p508852, p510444], VOLUNTEER, true)
