#include "../lib/_constants.cs"

# ============================================================
# SAC 2026 - Manual Overrides
# ============================================================
# Runs AFTER import.cs, BEFORE volunteer_teams.cs and group assignments.

# --- Streaming team (no staff tasks) ---
# Luigi Segura y Klaus Ramos → Streaming, quitar del pool de staff
DeleteProperty([2018MELO07], VOLUNTEER)
DeleteProperty([2016RAMO01], VOLUNTEER)
SetProperty([2018MELO07, 2016RAMO01], "streaming", true)

# --- No tasks ---
# Guido Dipietro (Senior Delegate / WCA Board) → sin tareas de staff
DeleteProperty([2013DIPI01], VOLUNTEER)
DeleteProperty([2013DIPI01], STAGE_LEAD)
DeleteProperty([2013DIPI01], TEAM_LEAD)

# Enrymar Cisneros (Regional Delegate) → sin tareas de staff
DeleteProperty([2013CISN01], VOLUNTEER)
DeleteProperty([2013CISN01], STAGE_LEAD)
DeleteProperty([2013CISN01], TEAM_LEAD)

# Diego Alejandro Casas (Organizador) → fuera del pool de staff
DeleteProperty([2014JIME05], VOLUNTEER)
DeleteProperty([2014JIME05], STAGE_LEAD)
DeleteProperty([2014JIME05], TEAM_LEAD)

# Eduard Esteban García (Organizador) → fuera del pool de staff
DeleteProperty([2011EDUA01], VOLUNTEER)
DeleteProperty([2011EDUA01], STAGE_LEAD)
DeleteProperty([2011EDUA01], TEAM_LEAD)

# Catalina Herrera López (Organizadora) → fuera del pool de staff
DeleteProperty([2017LOPE31], VOLUNTEER)
DeleteProperty([2017LOPE31], STAGE_LEAD)
DeleteProperty([2017LOPE31], TEAM_LEAD)

# Maarten Goossens (2024GOOS03, NL) → lead de eventos no oficiales (Zona Verde).
# Fuera del pool de staff regular — no juzga/mezcla/corre en salas principales.
# En unofficial.cs se le asigna como "Lead" en cada evento no oficial.
DeleteProperty([2024GOOS03], VOLUNTEER)
DeleteProperty([2024GOOS03], STAGE_LEAD)
DeleteProperty([2024GOOS03], TEAM_LEAD)
SetProperty([2024GOOS03], "unofficial_lead", true)

# --- Delegados removidos del staff (solo compiten) ---
# NOTE: Brian Hambeck (2016HAMB02), Gabriel Sargeiro (2014MELL03),
# Israel Fraga (2012SILV22), Kalani Oliveira (2018OLIV28), Mateo Aguirre (2022AGUI03)
# are no longer in import.cs — they registered as competitors only (no Cargo).
#
# CONFLICT: Dennis Rosero (2010ROSE03) appears in SAC2026-registration with
# Cargo=Voluntario but was previously demoted here. Assuming the registration
# is authoritative — if committee still wants him out of staff, re-add the
# DeleteProperty calls below.
# DeleteProperty([2010ROSE03], VOLUNTEER)
# DeleteProperty([2010ROSE03], STAGE_LEAD)
# DeleteProperty([2010ROSE03], TEAM_LEAD)

# --- Bajar de team lead (quedan como staff regular) ---
# Alexandre Ondet, Andrés Suzuki, Elias Acosta, Jhonatan Reategui,
# Lucas Ichiro, Marlon Marques, Rafael Sanchez, Dennis Rosero
# (Sergio Guillen se mantiene como TEAM_LEAD — confirmado como team lead.)
DeleteProperty([2017ONDE01], TEAM_LEAD)
DeleteProperty([2016SUZU03], TEAM_LEAD)
DeleteProperty([2016ACOS08], TEAM_LEAD)
DeleteProperty([2016REAT01], TEAM_LEAD)
DeleteProperty([2014YUNO01], TEAM_LEAD)
DeleteProperty([2014MARQ02], TEAM_LEAD)
DeleteProperty([2014SANC19], TEAM_LEAD)
DeleteProperty([2010ROSE03], TEAM_LEAD)

# --- Promover a team lead ---
# 8 originales: Ronny Morocho, Manuel Popayán, Haiver Reyes, Rocío Rodríguez
# + 3 nuevos confirmados: Marvin Solano (CR), Michael Castillo (CO), Jose "Coto" Gaete (CL)
SetProperty([2018MORO01], TEAM_LEAD, true)
SetProperty([2017POPA01], TEAM_LEAD, true)
SetProperty([2017GARC48], TEAM_LEAD, true)
SetProperty([2016RIVE14], TEAM_LEAD, true)
SetProperty([2018SOLA08], TEAM_LEAD, true)
SetProperty([2011CAST02], TEAM_LEAD, true)
SetProperty([2017GAET01], TEAM_LEAD, true)

# --- Team leads que se mantienen ---
# Joel Hernández (2007HERN02), Pedro Miranda (2014MORE05),
# João Vinícius Santos (2016SANT66), Cristian Vega (2013VEGA03),
# Sergio Guillen (2014IBAR01) — 5 leads que ya tienen TEAM_LEAD desde import.cs
# → No requieren cambio aquí.

# --- PENDING team lead: Felipe Andres Rojas Garces (2009GARC02, CL) ---
# Actualmente aparece con Status='b' en SAC2026-registration.xlsx.
# Cuando confirme su registro, agregar:
#   SetProperty([2009GARC02], VOLUNTEER, true)
#   SetProperty([2009GARC02], STAGE_LEAD, true)
#   SetProperty([2009GARC02], TEAM_LEAD, true)
#   SetProperty([2009GARC02], DELEGATE_RANK, "full")
