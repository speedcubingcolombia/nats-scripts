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
#   TEAM_LEAD = Delegates trusted to supervise groups (Delegate job).
#               Must be an active delegate. Selected per delegate coordinator
#               recommendation, independent of formal rank. Excludes:
#                 - WMCT / regional / senior delegates (other roles)
#                 - Specific delegates flagged not to assign supervisor responsibility
#                 - Colombian organizers (other roles)
#   LISTED_DELEGATE = ALL delegates → marked for clustering/tracking
#   VOLUNTEER = Non-delegate staff + Junior/Trainee delegates → judge/scramble/run

# --- Full Delegates from volunteer list ---
# Includes 2016RIVE01 (Gustavo Riveiro, PY) — promoted from Junior to Full per WCA
# (xlsx data is outdated; WCA API confirms full delegate).
SetProperty([2007HERN02, 2014MARQ02, 2014SANC19, 2014MORE05, 2016RIVE01], VOLUNTEER, true)
SetProperty([2007HERN02, 2014MARQ02, 2014SANC19, 2014MORE05, 2016RIVE01], LISTED_DELEGATE, true)
SetProperty([2007HERN02, 2014MARQ02, 2014SANC19, 2016RIVE01], DELEGATE_RANK, "full")
SetProperty([2014MORE05], DELEGATE_RANK, "regional")
# Team Lead designation (subset — see exclusions below).
SetProperty([2014MARQ02, 2014SANC19, 2014MORE05], TEAM_LEAD, true)
# Rejected: 2009GARC02 (Felipe Rojas Garces) — registration denied (Status=b),
#           also flagged as not-Team-Lead.
# Excluded as Team Lead:
#   2007HERN02 (Joel Hernandez) — flagged not to assign supervisor responsibility.
#   2016REAT01 (Jhonatan Reategui) — removed, will not attend.
#   2016RIVE01 (Gustavo Riveiro) — dropped for 3 TL/team (PY duplicate with Acosta).

# --- Junior Delegates from volunteer list ---
# 2016RIVE01 (Gustavo) was here originally but was promoted to Full — see Full block above.
SetProperty([2019LUCE01, 2015TERR01, 2017GAET01, 2017PINT05, 2015CAND01, 2017SOUZ14], VOLUNTEER, true)
SetProperty([2019LUCE01, 2015TERR01, 2017GAET01, 2017PINT05, 2015CAND01, 2017SOUZ14], LISTED_DELEGATE, true)
SetProperty([2019LUCE01, 2015TERR01, 2017GAET01, 2017PINT05, 2015CAND01, 2017SOUZ14], DELEGATE_RANK, "junior")
# Promoted as Team Leads (junior rank, but trusted to supervise):
#   Josias Sirpa Pinto (BO, experienced organizer), Thales Araújo de Souza (BR).
# Excluded as Team Lead:
#   2015CAND01 Daniel Delgado Candia (BO) — no constraint, replaced by Josias.
#   2015TERR01 Fabricio Yañez Terrazas (BO) — no constraint, replaced by Josias.
#   2019LUCE01 Axel Romero Lucero (CL) — newest junior in original list (WCA 2019).
#   2017GAET01 José Gaete (CL) — replaced by Thales (BR) for 1 BR-TL/team.
SetProperty([2017PINT05, 2017SOUZ14], TEAM_LEAD, true)

# --- Trainee Delegates from volunteer list (regular staff) ---
SetProperty([2016SANC08, 2014BENA03, 2021MONS01], VOLUNTEER, true)
SetProperty([2016SANC08, 2014BENA03, 2021MONS01], LISTED_DELEGATE, true)
SetProperty([2016SANC08, 2014BENA03, 2021MONS01], DELEGATE_RANK, "trainee")
# 2023ZVIN01 (Lucas Zvinys) — promoted from Trainee to Junior (2026-05-18).
SetProperty([2023ZVIN01], VOLUNTEER, true)
SetProperty([2023ZVIN01], LISTED_DELEGATE, true)
SetProperty([2023ZVIN01], DELEGATE_RANK, "junior")
# Removed: 2015VILL19 (Nayarid Villarreal, VE Trainee) — informed will not attend (2026-05-06).

# --- Delegates from registration form (not in volunteer list) ---
# Full + Senior delegates
SetProperty([2014IBAR01, 2016SUZU03, 2013DIPI01, 2013VEGA03, 2016ACOS08, 2016SANT66, 2014YUNO01, 2017ONDE01], LISTED_DELEGATE, true)
SetProperty([2014IBAR01, 2016SUZU03, 2016ACOS08, 2016SANT66, 2014YUNO01, 2017ONDE01], DELEGATE_RANK, "full")
SetProperty([2013DIPI01], DELEGATE_RANK, "senior")
SetProperty([2013VEGA03], DELEGATE_RANK, "full")
# Team Lead designation (subset — Full delegates trusted to supervise):
#   Sergio Ibarra, Elias Acosta, Lucas Yunomae, Alexandre Ondet.
SetProperty([2014IBAR01, 2016ACOS08, 2014YUNO01, 2017ONDE01], TEAM_LEAD, true)
# Excluded: 2016SUZU03 (Andrés Suzuki) — dropped for 3 TL/team (PE duplicate).
# Excluded as Team Lead:
#   2013VEGA03 (Cristian Vega) — flagged not to assign supervisor responsibility.
#   2016SANT66 (João Vinícius Santos) — likely covering other tasks.
#   2013DIPI01 (Guido Dipietro, senior) — senior delegates have other roles.
# Reclassified: 2010ROSE03 (Dennis Rosero) — no longer an active delegate;
#               kept only as VOLUNTEER (cargo Voluntario in registration).
#               See volunteer block below.
# Removed: 2018OLIV28 (Kalani Oliveira) — registered as competitor only, not staff
# Removed: 2015TRIG02 Jorge Miguel Trigo (BO Full) — "Pendiente"/"Sin contactar" en
#          Intención de Registro; no en xlsx ni CSV → not coming as staff.

# Junior (regular staff)
SetProperty([2017POPA01, 2017GARC48, 2021LOPE01, 2016MART84, 2018MORO01, 2016RIVE14, 2018SOLA08], LISTED_DELEGATE, true)
SetProperty([2017POPA01, 2017GARC48, 2021LOPE01, 2016MART84, 2018MORO01, 2016RIVE14, 2018SOLA08], DELEGATE_RANK, "junior")
# Removed: 2011CAST02 (Michael Castillo, CO) — informed will not attend (2026-05-05).
# Promoted as Team Lead (junior rank, but trusted to supervise):
#   Manuel Popayán (CO), Haiver Reyes (CO), Juan Nicolás Pinzón (CO).
# Excluded as Team Lead:
#   2021LOPE01 (Juan Felipe Gómez, CO) — self-excluded from TL.
#   2016RIVE14 (Rocio Rodriguez Rivera, MX) — junior non-CO from original list.
#   2018MORO01 (Ronny Morocho, EC) — not in original list.
#   2018SOLA08 (Marvin Solano, CR) — flagged not to assign supervisor responsibility.
#   2024SANC70 (Story Varela, CO Trainee) — only non-TL Colombian delegate.
SetProperty([2017POPA01, 2017GARC48, 2016MART84], TEAM_LEAD, true)
# Removed: 2014MELL03 (Gabriel Sargeiro) — no longer registered
# Removed: 2012SILV22 (Israel Fraga da Silva) — registered as competitor only

# Regional (regular staff, not team lead)
SetProperty([2013CISN01], LISTED_DELEGATE, true)
SetProperty([2013CISN01], DELEGATE_RANK, "regional")
# Removed: 2015BALD03 Xavier Antonio Balderrama (BO Regional) — "Pendiente"/"Sin
#          contactar" en Intención de Registro; no en xlsx → not coming as staff.

# Trainee (regular staff)
# 2023FILH05 (Antonio Castro Costa Filho, BR): re-added per Intención de Registro
# (¿Delegado?=Si in Participación sheet); was previously excluded because his
# delegate cargo was rejected in SAC2026-registration.
SetProperty([2024SANC70, 2016LIMA02, 2016CABA07, 2017RODR53, 2023FILH05], LISTED_DELEGATE, true)
SetProperty([2024SANC70, 2016LIMA02, 2016CABA07, 2017RODR53, 2023FILH05], DELEGATE_RANK, "trainee")
# Removed: 2016HAMB02 (Brian Hambeck), 2022AGUI03 (Mateo Aguirre)
#          — both ¿Delegado?=No Respondió in Intención xlsx, won't act as delegate.
# Removed: 2017PERE38 Pedro Agustín Mora Pérez (CL Trainee) — "Pendiente"/"Sin contactar".
# Removed: 2023SILV92 José Augusto Almeida da Silva (BR Trainee) — "No Registrado"/"No sabe si asiste".
# Removed: 2024ALME13 Jefferson Feitosa Almeida (BR Junior) — "No Registrado"/"No sabe si asiste".

# --- Volunteers (non-delegate staff) ---
SetProperty([2016NINO01, 2025ACEV05, 2023LAND18, 2021VARG02, 2013GONZ09, 2019GUAM01, 2023RODR80, 2019GUTI14, 2024SANC61, 2017GUZM05, 2025LASP01, 2023AZUA01, 2017MORA12, 2022MARI01, 2024SOLE01, 2018PERE37, 2023MORR23, 2023ESPI07, 2011PARR02, 2014QUIN03, 2023MORE20, 2011DION02, 2012MARI04, 2024BLAN13, 2017BARR25, 2013RIVE03, 2023BEYA01, 2016PIMI02, 2023RAMI49, 2023MONT31, 2016RAMO01, 2018RODR43, 2015HENR02, 2017CUES02, 2024QUIN14, 2024COLO04, 2023GONZ30, 2022CUER01, 2018CRUZ17, 2017CULM01, 2022QUIN17, 2019SANC20, 2022CUBI01, 2023SILV54, 2022MARQ01, 2024GUTI02, 2017MUNO06, 2025LANC04, 2013CAST14, 2018KUMA01, 2016COEL04, 2017MARQ06, 2013MOTT01, 2023QUIN18, 2024GOOS03, 2024MEDI13, 2024SANT99, 2024VALD01, 2025CADE01, 2025FUEN05, 2010ROSE03], VOLUNTEER, true)
# Removed: 2017MART94 (Víctor Adán Solis Martinez) — competitor only, not staff.
# 2010ROSE03 (Dennis Rosero) — no longer an active delegate; cargo Voluntario.
# Removed (registered as competitors only, not approved staff):
#   2012PERE04, 2015TORR12, 2018GONZ25, 2019CAMP10, 2022PINE05

# --- Organizers (staff, not delegates) ---
# Local organizing committee — marked as VOLUNTEER so they appear in Cluster pool.
SetProperty([2011EDUA01, 2014JIME05, 2017LOPE31], VOLUNTEER, true)

# --- Streaming (dedicated role) ---
# NOTAS: Luigi Segura, Klaus Ramos, Ricardo Hurtado Torres → streaming only.
# Klaus is already in the volunteer list above; Luigi and Ricardo are added here.
# Exclude from judge/scramble/run pool at assignment time via the streaming task.
SetProperty([2018MELO07, 2020TORR01], VOLUNTEER, true)

# --- Delegados confirmados que NO asisten (informativo, no se asignan) ---
# 2016LOPE37 Rubén López de Juan (ES Full) — attending, no operational role (see overrides.cs).
# 2015SALO01 Álvaro Aguilar Salobreña (ES Full) — support from España, no asiste.
# 2011SATO01 Heron Sato (BR Full) — listado como Organizador (org-delg), no como
#            staff de turnos diarios; sin propiedades en pipeline.
# PENDING: Álvaro (2015SALO01), Rubén (2016LOPE37)
#          — pending confirmation on competing status (2026-05-18).

# Confirmed volunteers de "voluntarios listado.xlsx" pero ausentes de
# SAC2026-registration → agregados vía AddPerson en add_missing_staff.cs.

# --- Score Takers (data entry dedicado, excluidos de judge/scramble/run) ---
# Equipo fijo de 4 personas para score taking en los 4 días de competencia.
# Seleccionados por: pref-data-entry alto, pocos eventos (menos conflictos),
# disponibilidad 4 días, foco en data entry sobre otras tareas.
#   1. 2017MARQ06 Laís Helena Réga Serra Marques (BR, 1 evento, foco +5, habla PT)
#   2. 2018PERE37 Francia Perez (CO, 4 eventos, foco +1)
#   3. 2016LIMA02 Adriana Saavedra Limachi (BO Trainee Delegate, 3 eventos, DE=10)
#   4. 2017MUNO06 Valentina Sánchez Muñoz (CO, 4 eventos, DE=10)
SetProperty([2017MARQ06, 2018PERE37, 2016LIMA02, 2017MUNO06], "score-taker", true)

# --- Portuguese speakers (used by team clustering: min 1 PT speaker per team) ---
# Brazilian accepted staff (native PT) + non-BR staff with fluent/working PT.
# Only people in staff pool (VOLUNTEER or LISTED_DELEGATE) — excludes:
#   - 2016RAMO01 (Klaus Ramos): streaming only, removed from VOLUNTEER in overrides.cs.
#   - 2016SANT66 (João Vinícius Santos): organizer, removed from staff in overrides.cs.
#   - Self-reported "un poco de portugués" (2011PARR02, 2018CRUZ17).
SetProperty([2013MOTT01, 2014MARQ02, 2014MORE05, 2014YUNO01, 2016COEL04,
             2017MARQ06, 2017SOUZ14, 2023QUIN18,
             2007HERN02, 2015TERR01, 2016SANC08, 2017GAET01, 2021MONS01,
             2022MARI01, 2023MORR23, 2023RAMI49, 2025CADE01], SPEAKS_PT, true)

# --- Summary ---
Header("Team Leads (Delegates supervising groups)")
Persons(BooleanProperty(TEAM_LEAD))

Header("Other Delegates (judge/scramble/run)")
Persons(And(BooleanProperty(LISTED_DELEGATE), Not(BooleanProperty(TEAM_LEAD))))

Header("Volunteers (Non-delegate staff)")
Persons(And(BooleanProperty(VOLUNTEER), Not(BooleanProperty(LISTED_DELEGATE))))

Header("Portuguese speakers")
Persons(BooleanProperty(SPEAKS_PT))

Header("All Staff")
Persons(Or(BooleanProperty(VOLUNTEER), BooleanProperty(LISTED_DELEGATE)))
