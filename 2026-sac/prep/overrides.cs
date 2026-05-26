#include "../lib/_constants.cs"

# ============================================================
# SAC 2026 - Manual Overrides
# ============================================================
# Runs AFTER import.cs, BEFORE volunteer_teams.cs and group assignments.

# --- Streaming team (no staff tasks) ---
# Luigi Segura, Klaus Ramos, Ricardo Hurtado Torres → Streaming, remove from staff pool
DeleteProperty([2018MELO07], VOLUNTEER)
DeleteProperty([2016RAMO01], VOLUNTEER)
DeleteProperty([2020TORR01], VOLUNTEER)
SetProperty([2018MELO07, 2016RAMO01, 2020TORR01], "streaming", true)

# --- Delegates without operational role ---
DeleteProperty([2013DIPI01], VOLUNTEER)
DeleteProperty([2013DIPI01], LISTED_DELEGATE)
DeleteProperty([2013DIPI01], TEAM_LEAD)
SetProperty([2013DIPI01], "special-role", "Senior Delegate")

DeleteProperty([2013CISN01], VOLUNTEER)
DeleteProperty([2013CISN01], LISTED_DELEGATE)
DeleteProperty([2013CISN01], TEAM_LEAD)
SetProperty([2013CISN01], "special-role", "Regional Delegate")

DeleteProperty([2016LOPE37], VOLUNTEER)
DeleteProperty([2016LOPE37], LISTED_DELEGATE)
DeleteProperty([2016LOPE37], TEAM_LEAD)
SetProperty([2016LOPE37], "special-role", "WCA Board")

# --- Organizers ---
DeleteProperty([2014JIME05], VOLUNTEER)
DeleteProperty([2014JIME05], LISTED_DELEGATE)
DeleteProperty([2014JIME05], TEAM_LEAD)
SetProperty([2014JIME05], "special-role", "Organizer")

DeleteProperty([2011EDUA01], VOLUNTEER)
DeleteProperty([2011EDUA01], LISTED_DELEGATE)
DeleteProperty([2011EDUA01], TEAM_LEAD)
SetProperty([2011EDUA01], "special-role", "Organizer")

DeleteProperty([2017LOPE31], VOLUNTEER)
DeleteProperty([2017LOPE31], LISTED_DELEGATE)
DeleteProperty([2017LOPE31], TEAM_LEAD)
SetProperty([2017LOPE31], "special-role", "Organizer")

DeleteProperty([2016SANT66], VOLUNTEER)
DeleteProperty([2016SANT66], LISTED_DELEGATE)
DeleteProperty([2016SANT66], TEAM_LEAD)
SetProperty([2016SANT66], "special-role", "Organizer")

# --- Unofficial events lead ---
DeleteProperty([2024GOOS03], VOLUNTEER)
DeleteProperty([2024GOOS03], LISTED_DELEGATE)
DeleteProperty([2024GOOS03], TEAM_LEAD)
SetProperty([2024GOOS03], "unofficial_lead", true)
SetProperty([2024GOOS03], "special-role", "Unofficial Events Lead")

# --- Score Takers (out of team pool, dedicated data entry) ---
DeleteProperty([2017MARQ06, 2018PERE37, 2016LIMA02, 2017MUNO06], VOLUNTEER)
DeleteProperty([2016LIMA02], LISTED_DELEGATE)
SetProperty([2017MARQ06], "special-role", "Score Taker")
SetProperty([2018PERE37], "special-role", "Score Taker")
SetProperty([2016LIMA02], "special-role", "Score Taker")
SetProperty([2017MUNO06], "special-role", "Score Taker")

# --- Coordination / other tasks ---
DeleteProperty([2021LOPE01], VOLUNTEER)
DeleteProperty([2021LOPE01], LISTED_DELEGATE)
SetProperty([2021LOPE01], "special-role", "Delegate Coordinator")

DeleteProperty([p474926], VOLUNTEER)
SetProperty([p474926], "special-role", "Support")

DeleteProperty([p476324], VOLUNTEER)
SetProperty([p476324], "special-role", "Support")

# --- Delegados removidos del staff (competitors only) ---
# NOTE: Brian Hambeck (2016HAMB02), Gabriel Sargeiro (2014MELL03),
# Israel Fraga (2012SILV22), Kalani Oliveira (2018OLIV28), Mateo Aguirre (2022AGUI03)
# are no longer in import.cs — they registered as competitors only (no Cargo).
#
# CONFLICT: Dennis Rosero (2010ROSE03) appears in SAC2026-registration with
# Cargo=Voluntario but was previously demoted here. Assuming the registration
# is authoritative — if committee still wants him out of staff, re-add the
# DeleteProperty calls below.
# DeleteProperty([2010ROSE03], VOLUNTEER)
# DeleteProperty([2010ROSE03], LISTED_DELEGATE)
# DeleteProperty([2010ROSE03], TEAM_LEAD)

# --- Team Lead overrides ---
# import.cs is the authoritative source of TEAM_LEAD designations (see header
# there for inclusion/exclusion policy). No TL overrides here.
#
# PENDING — Colombian junior delegates (TBD whether to add as TL):
#   2018MORO01 Ronny Morocho, 2017POPA01 Manuel Popayán,
#   2017GARC48 Haiver Reyes, 2011CAST02 Michael Castillo.
# Per delegate coordinator: non-organizer Colombians can be Team Leads.
# These four are non-organizers (organizers are 2011EDUA01, 2014JIME05, 2017LOPE31).
# Add via SetProperty([id], TEAM_LEAD, true) here if confirmed.
#
# PENDING — Felipe Andres Rojas Garces (2009GARC02, CL): Status='b' in registration.
# When his registration is approved, restore as full delegate (NOT TL — flagged).
