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

# --- Delegados removidos del staff (solo compiten) ---
# Brian Hambeck, Dennis Rosero, Gabriel Sargeiro, Israel Fraga, Kalani Oliveira, Mateo Aguirre
DeleteProperty([2016HAMB02], VOLUNTEER)
DeleteProperty([2016HAMB02], STAGE_LEAD)
DeleteProperty([2016HAMB02], TEAM_LEAD)
DeleteProperty([2010ROSE03], VOLUNTEER)
DeleteProperty([2010ROSE03], STAGE_LEAD)
DeleteProperty([2010ROSE03], TEAM_LEAD)
# Gabriel Sargeiro (2014MELL03) — no longer in WCIF, skip
DeleteProperty([2012SILV22], VOLUNTEER)
DeleteProperty([2012SILV22], STAGE_LEAD)
DeleteProperty([2012SILV22], TEAM_LEAD)
DeleteProperty([2018OLIV28], VOLUNTEER)
DeleteProperty([2018OLIV28], STAGE_LEAD)
DeleteProperty([2018OLIV28], TEAM_LEAD)
DeleteProperty([2022AGUI03], VOLUNTEER)
DeleteProperty([2022AGUI03], STAGE_LEAD)
DeleteProperty([2022AGUI03], TEAM_LEAD)

# --- Bajar de team lead (quedan como Jr/Trainee) ---
# Alexandre Ondet, Andrés Suzuki, Elias Acosta, Jhonatan Reategui,
# Lucas Ichiro, Marlon Marques, Rafael Sanchez, Sergio Guillen
DeleteProperty([2017ONDE01], TEAM_LEAD)
DeleteProperty([2016SUZU03], TEAM_LEAD)
DeleteProperty([2016ACOS08], TEAM_LEAD)
DeleteProperty([2016REAT01], TEAM_LEAD)
DeleteProperty([2014YUNO01], TEAM_LEAD)
DeleteProperty([2014MARQ02], TEAM_LEAD)
DeleteProperty([2014SANC19], TEAM_LEAD)
DeleteProperty([2014IBAR01], TEAM_LEAD)

# --- Promover a team lead ---
# Ronny Morocho, Manuel Popayán, Haiver Reyes, Rocío Rodríguez
SetProperty([2018MORO01], TEAM_LEAD, true)
SetProperty([2017POPA01], TEAM_LEAD, true)
SetProperty([2017GARC48], TEAM_LEAD, true)
SetProperty([2016RIVE14], TEAM_LEAD, true)

# --- Team leads que se mantienen ---
# Joel Hernández (2007HERN02), Pedro Miranda (2014MORE05),
# João Vinícius Santos (2016SANT66), Cristian Vega (2013VEGA03)
# → Ya son TEAM LEAD, no requieren cambio.
