#include "../lib/_constants.cs"

# ============================================================
# SAC 2026 - Import volunteers and delegates
# ============================================================
# Source of truth: SAC2026-registration.xlsx (Cargo column).
# Filter: Status='a' AND Registration Status='accepted' AND
#         Cargo in {Voluntario, Delegado, Organizador, Lider, Streaming}.
# Total: 104 approved staff.
#
# Roles:
#   TEAM_LEAD = Full/Senior delegates → supervise groups only (Delegate job)
#   STAGE_LEAD = ALL delegates → marked for clustering/tracking
#   VOLUNTEER = Non-delegate staff + Junior/Trainee delegates → judge/scramble/run

# --- Full Delegates from volunteer list (TEAM LEADS) ---
SetProperty([2016REAT01, 2007HERN02, 2014MARQ02, 2014SANC19, 2014MORE05], VOLUNTEER, true)
SetProperty([2016REAT01, 2007HERN02, 2014MARQ02, 2014SANC19, 2014MORE05], STAGE_LEAD, true)
SetProperty([2016REAT01, 2007HERN02, 2014MARQ02, 2014SANC19, 2014MORE05], TEAM_LEAD, true)
SetProperty([2016REAT01, 2007HERN02, 2014MARQ02, 2014SANC19, 2014MORE05], DELEGATE_RANK, "full")
# Rejected: 2009GARC02 (Felipe Rojas Garces) — registration denied (Status=b)

# --- Junior Delegates from volunteer list (regular staff) ---
SetProperty([2019LUCE01, 2015TERR01, 2016RIVE01, 2017GAET01, 2017PINT05, 2015CAND01, 2017SOUZ14], VOLUNTEER, true)
SetProperty([2019LUCE01, 2015TERR01, 2016RIVE01, 2017GAET01, 2017PINT05, 2015CAND01, 2017SOUZ14], STAGE_LEAD, true)
SetProperty([2019LUCE01, 2015TERR01, 2016RIVE01, 2017GAET01, 2017PINT05, 2015CAND01, 2017SOUZ14], DELEGATE_RANK, "junior")

# --- Trainee Delegates from volunteer list (regular staff) ---
SetProperty([2016SANC08, 2023ZVIN01, 2015VILL19, 2014BENA03, 2021MONS01], VOLUNTEER, true)
SetProperty([2016SANC08, 2023ZVIN01, 2015VILL19, 2014BENA03, 2021MONS01], STAGE_LEAD, true)
SetProperty([2016SANC08, 2023ZVIN01, 2015VILL19, 2014BENA03, 2021MONS01], DELEGATE_RANK, "trainee")

# --- Delegates from registration form (not in volunteer list) ---
# Full + Senior (TEAM LEADS)
SetProperty([2010ROSE03, 2014IBAR01, 2016SUZU03, 2013DIPI01, 2013VEGA03, 2016ACOS08, 2016SANT66, 2014YUNO01, 2017ONDE01], STAGE_LEAD, true)
SetProperty([2010ROSE03, 2014IBAR01, 2016SUZU03, 2013DIPI01, 2013VEGA03, 2016ACOS08, 2016SANT66, 2014YUNO01, 2017ONDE01], TEAM_LEAD, true)
SetProperty([2010ROSE03, 2014IBAR01, 2016SUZU03, 2016ACOS08, 2016SANT66, 2014YUNO01, 2017ONDE01], DELEGATE_RANK, "full")
SetProperty([2013DIPI01], DELEGATE_RANK, "senior")
SetProperty([2013VEGA03], DELEGATE_RANK, "full")
# Removed: 2018OLIV28 (Kalani Oliveira) — registered as competitor only, not staff
# PENDING: 2015TRIG02 (Full Delegate, Team Lead)

# Junior (regular staff)
SetProperty([2017POPA01, 2011CAST02, 2017GARC48, 2021LOPE01, 2016MART84, 2018MORO01, 2016RIVE14, 2018SOLA08], STAGE_LEAD, true)
SetProperty([2017POPA01, 2011CAST02, 2017GARC48, 2021LOPE01, 2016MART84, 2018MORO01, 2016RIVE14, 2018SOLA08], DELEGATE_RANK, "junior")
# Removed: 2014MELL03 (Gabriel Sargeiro) — no longer registered
# Removed: 2012SILV22 (Israel Fraga da Silva) — registered as competitor only

# Regional (regular staff, not team lead)
SetProperty([2013CISN01], STAGE_LEAD, true)
SetProperty([2013CISN01], DELEGATE_RANK, "regional")
# PENDING: 2015BALD03 (Regional Delegate)

# Trainee (regular staff)
SetProperty([2024SANC70, 2016LIMA02, 2016CABA07, 2017RODR53], STAGE_LEAD, true)
SetProperty([2024SANC70, 2016LIMA02, 2016CABA07, 2017RODR53], DELEGATE_RANK, "trainee")
# Removed: 2016HAMB02 (Brian Hambeck), 2022AGUI03 (Mateo Aguirre),
#          2023FILH05 (Antonio Castro Costa Filho) — registered as competitors only
# PENDING: 2017PERE38, 2023SILV92 (Trainee Delegates)

# --- Volunteers (non-delegate staff) ---
SetProperty([2016NINO01, 2025ACEV05, 2023LAND18, 2021VARG02, 2013GONZ09, 2019GUAM01, 2023RODR80, 2019GUTI14, 2024SANC61, 2017GUZM05, 2025LASP01, 2023AZUA01, 2017MORA12, 2022MARI01, 2024SOLE01, 2018PERE37, 2023MORR23, 2023ESPI07, 2011PARR02, 2014QUIN03, 2023MORE20, 2011DION02, 2012MARI04, 2024BLAN13, 2017BARR25, 2013RIVE03, 2023BEYA01, 2016PIMI02, 2023RAMI49, 2023MONT31, 2016RAMO01, 2018RODR43, 2015HENR02, 2017CUES02, 2024QUIN14, 2024COLO04, 2023GONZ30, 2022CUER01, 2018CRUZ17, 2017CULM01, 2022QUIN17, 2019SANC20, 2022CUBI01, 2023SILV54, 2022MARQ01, 2024GUTI02, 2017MUNO06, 2025LANC04, 2017MART94, 2013CAST14, 2018KUMA01, 2016COEL04, 2017MARQ06, 2013MOTT01, 2023QUIN18, 2024GOOS03, 2024MEDI13, 2024SANT99, 2024VALD01, 2025CADE01, 2025FUEN05], VOLUNTEER, true)
# Removed (registered as competitors only, not approved staff):
#   2012PERE04, 2015TORR12, 2018GONZ25, 2019CAMP10, 2022PINE05

# --- Organizers (staff, not delegates) ---
# Local organizing committee — marked as VOLUNTEER so they appear in Cluster pool.
SetProperty([2011EDUA01, 2014JIME05, 2017LOPE31], VOLUNTEER, true)

# --- Streaming (dedicated role) ---
# NOTAS: Luigi Segura y Klaus Ramos → streaming only. Klaus is already in the
# volunteer list above; Luigi is added here. Exclude from judge/scramble/run pool
# at assignment time via the streaming task.
SetProperty([2018MELO07], VOLUNTEER, true)

# PENDING: 2025BELT01, 2022LIZA02, 2025MONG07, 2024SUAR10, 2015RODR37, 2025CARD14, 2025FAND01, 2025DELG07 (Volunteers)

# --- Summary ---
Header("Team Leads (Full/Senior Delegates - supervise only)")
Persons(BooleanProperty(TEAM_LEAD))

Header("Other Delegates (Junior/Trainee - judge/scramble/run)")
Persons(And(BooleanProperty(STAGE_LEAD), Not(BooleanProperty(TEAM_LEAD))))

Header("Volunteers (Non-delegate staff)")
Persons(And(BooleanProperty(VOLUNTEER), Not(BooleanProperty(STAGE_LEAD))))

Header("All Staff")
Persons(Or(BooleanProperty(VOLUNTEER), BooleanProperty(STAGE_LEAD)))
