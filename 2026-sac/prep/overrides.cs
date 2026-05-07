#include "../lib/_constants.cs"

# ============================================================
# SAC 2026 - Manual Overrides
# ============================================================
# Runs AFTER import.cs, BEFORE volunteer_teams.cs and group assignments.

# --- Streaming team (no staff tasks) ---
# Luigi Segura y Klaus Ramos → Streaming, remove from staff pool
DeleteProperty([2018MELO07], VOLUNTEER)
DeleteProperty([2016RAMO01], VOLUNTEER)
SetProperty([2018MELO07, 2016RAMO01], "streaming", true)

# --- No tasks ---
# Guido Dipietro (Senior Delegate / WCA Board) → no staff tasks
DeleteProperty([2013DIPI01], VOLUNTEER)
DeleteProperty([2013DIPI01], LISTED_DELEGATE)
DeleteProperty([2013DIPI01], TEAM_LEAD)

# Enrymar Cisneros (Regional Delegate) → no staff tasks
DeleteProperty([2013CISN01], VOLUNTEER)
DeleteProperty([2013CISN01], LISTED_DELEGATE)
DeleteProperty([2013CISN01], TEAM_LEAD)

# Diego Alejandro Casas (Organizador) → out of staff pool
DeleteProperty([2014JIME05], VOLUNTEER)
DeleteProperty([2014JIME05], LISTED_DELEGATE)
DeleteProperty([2014JIME05], TEAM_LEAD)

# Eduard Esteban García (Organizador) → out of staff pool
DeleteProperty([2011EDUA01], VOLUNTEER)
DeleteProperty([2011EDUA01], LISTED_DELEGATE)
DeleteProperty([2011EDUA01], TEAM_LEAD)

# Catalina Herrera López (Organizadora) → out of staff pool
DeleteProperty([2017LOPE31], VOLUNTEER)
DeleteProperty([2017LOPE31], LISTED_DELEGATE)
DeleteProperty([2017LOPE31], TEAM_LEAD)

# Maarten Goossens (2024GOOS03, NL) → unofficial events lead (Zona Verde).
# Out of pool de staff regular — does not judge/scramble/run in main rooms.
# Assigned in unofficial.cs as "Lead" for each unofficial event.
DeleteProperty([2024GOOS03], VOLUNTEER)
DeleteProperty([2024GOOS03], LISTED_DELEGATE)
DeleteProperty([2024GOOS03], TEAM_LEAD)
SetProperty([2024GOOS03], "unofficial_lead", true)

# João Vinícius Santos (2016SANT66, BR Full Delegate) → confirmed as Organizer
# en "Intención de Registro Delegados" (org-delg). Out of regular staff pool.
DeleteProperty([2016SANT66], VOLUNTEER)
DeleteProperty([2016SANT66], LISTED_DELEGATE)
DeleteProperty([2016SANT66], TEAM_LEAD)

# Juan Felipe Gómez López (2021LOPE01, CO Junior Delegate, delegate coordinator)
# Out of pool to remain available as free organizer/coordinator.
DeleteProperty([2021LOPE01], VOLUNTEER)
DeleteProperty([2021LOPE01], LISTED_DELEGATE)

# Juliana García Uribe (2025URIB01, uid 474926) — out of staff pool.
# Available for other tasks (no judge/scramble/run).
DeleteProperty([p474926], VOLUNTEER)

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
