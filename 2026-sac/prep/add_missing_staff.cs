#include "../lib/_constants.cs"

# SAC 2026 - Handle people without WCA IDs o no registrados oficialmente

# Angie Casallas: registered (wcaUserId=520057, no WCA ID yet). Add as volunteer.
SetProperty([p520057], VOLUNTEER, true)

# Felipe Andres Rojas Garces (2009GARC02, CL, wcaUserId=273): no se registró oficialmente
# pero va a ayudar como staff y team lead. Lo agregamos como non-competing staff
# vía AddPerson → aparece en WCIF con registrantId null hasta que haga PATCH con
# WCA portal. Full Delegate + Team Lead.
AddPerson(273, "Felipe Andres Rojas Garces")
SetProperty([p273], VOLUNTEER, true)
SetProperty([p273], STAGE_LEAD, true)
SetProperty([p273], TEAM_LEAD, true)
SetProperty([p273], DELEGATE_RANK, "full")

# Non-competing staff (Ana Milena, Danilo, Marcela): no longer in WCIF, pending re-registration
