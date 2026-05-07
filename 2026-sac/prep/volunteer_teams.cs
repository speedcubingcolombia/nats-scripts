#include "../lib/_constants.cs"
#include "../lib/_rooms.cs"
#include "../lib/_assigned_room.cs"

# SAC 2026 - Volunteer Team Assignment
# 4 teams that rotate daily: 3 cover main rooms, 1 is floating (BLD + unofficial + support).
# Uses Cluster() to create balanced teams.
#
# Constraints (following 2025 nats pattern):
# - LimitConstraint: hard min/max bounds per team
# - BalanceConstraint: soft balance across teams (weighted)
# - SpecificAssignmentScore: prefer certain people on certain teams

DeleteProperty(Persons(HasProperty(STAFF_TEAM)), STAFF_TEAM)

Cluster(
    STAFF_TEAM, 4,
    Persons(Or(BooleanProperty(VOLUNTEER), BooleanProperty(LISTED_DELEGATE))),
    WcaId(),
    Concat(
      [# LimitConstraint signature: (name, value, min, weight). No max parameter —
       # min sets a per-team floor; weight pushes the greedy algorithm to satisfy it.
       # Once min is met, LimitConstraint stops pushing — pair with BalanceConstraint
       # for even distribution beyond the floor.
       # Team size: ~99 total / 4 teams = ~25 avg. Strong push toward min 22 per team.
       LimitConstraint("Team Size", true, 22, 32),
       # Team leads: 12 confirmed → exactly 3 per team (12/4=3).
       LimitConstraint("Team Leads (min)", BooleanProperty(TEAM_LEAD), 3, 10),
       BalanceConstraint("Team Leads (balance)", BooleanProperty(TEAM_LEAD), 30),
       # Brazilian Team Leads: 4 confirmed (Lucas + Marlon + Pedro + Thales)
       # → floor of 1 per team + balance to keep them in distinct teams.
       LimitConstraint("Brazilian TLs (min)",
                       And(BooleanProperty(TEAM_LEAD), (Country() == "BR")), 1, 1000),
       BalanceConstraint("Brazilian TLs (balance)",
                         And(BooleanProperty(TEAM_LEAD), (Country() == "BR")), 200),
       # Colombian Team Leads: 4 confirmed (Sergio + Manuel + Haiver + JN Pinzón)
       # → floor of 1 per team + balance to keep them in distinct teams.
       LimitConstraint("Colombian TLs (min)",
                       And(BooleanProperty(TEAM_LEAD), (Country() == "CO")), 1, 1000),
       BalanceConstraint("Colombian TLs (balance)",
                         And(BooleanProperty(TEAM_LEAD), (Country() == "CO")), 200),
       # Rank-weighted: balance Full-rank TLs across teams (más alto = más peso).
       # 6 Full TLs / 4 teams → ~1.5/team.
       BalanceConstraint("Full TLs (balance)",
                         And(BooleanProperty(TEAM_LEAD), (StringProperty(DELEGATE_RANK) == "full")),
                         30),
       # Junior TLs balance (lower weight than Full per "rango más alto = más peso").
       BalanceConstraint("Junior TLs (balance)",
                         And(BooleanProperty(TEAM_LEAD), (StringProperty(DELEGATE_RANK) == "junior")),
                         15),
       # All delegates (44) balanced across teams
       BalanceConstraint("All Delegates", BooleanProperty(LISTED_DELEGATE), 5),
       # Balance delegate count (weighted strongly)
       BalanceConstraint("Delegates", HasRole("delegate"), 5),
       # Balance number of events per team
       BalanceConstraint("Num Events", Length(RegisteredEvents()), 0.2),
       # Balance volunteers
       BalanceConstraint("Volunteers", BooleanProperty(VOLUNTEER), 3),
       # BLD events balanced across teams
       BalanceConstraint("333bf", CompetingIn(_333bf), 3),
       BalanceConstraint("444bf", CompetingIn(_444bf), 5),
       BalanceConstraint("555bf", CompetingIn(_555bf), 5),
       BalanceConstraint("333mbf", CompetingIn(_333mbf), 5)],
      # Balance event registrations across teams
      Map([_333, _222, _444, _pyram, _skewb, _333oh],
          BalanceConstraint(EventId(), CompetingIn(), 0.05)),
      Map([_555, _666, _777, _333bf, _clock, _sq1, _minx],
          BalanceConstraint(EventId(), CompetingIn(), 0.1)),
      [# Balance Colombian and Brazilian volunteers (largest delegations)
       BalanceConstraint("Country CO", (Country() == "CO"), 5),
       BalanceConstraint("Country BR", (Country() == "BR"), 2)]))

# --- Team Summary ---
Header("Team 1 (Day1: Amarilla, Day2: Azul, Day3: Roja, Day4: Amarilla)")
Table(
  Sort(Persons((NumberProperty(STAFF_TEAM) == 1)), Name()),
  [Column("Name", Name()),
   Column("WCA ID", WcaId()),
   Column("Country", Country()),
   Column("Stage Lead", BooleanProperty(LISTED_DELEGATE)),
   Column("Events", Length(RegisteredEvents()))])

Header("Team 2 (Day1: Azul, Day2: Roja, Day3: Amarilla, Day4: Azul)")
Table(
  Sort(Persons((NumberProperty(STAFF_TEAM) == 2)), Name()),
  [Column("Name", Name()),
   Column("WCA ID", WcaId()),
   Column("Country", Country()),
   Column("Stage Lead", BooleanProperty(LISTED_DELEGATE)),
   Column("Events", Length(RegisteredEvents()))])

Header("Team 3 (Day1: Roja, Day2: Amarilla, Day3: Azul, Day4: Roja)")
Table(
  Sort(Persons((NumberProperty(STAFF_TEAM) == 3)), Name()),
  [Column("Name", Name()),
   Column("WCA ID", WcaId()),
   Column("Country", Country()),
   Column("Stage Lead", BooleanProperty(LISTED_DELEGATE)),
   Column("Events", Length(RegisteredEvents()))])

Header("Team 4 (Day1: Floating, Day2: Roja, Day3: Azul, Day4: Amarilla)")
Table(
  Sort(Persons((NumberProperty(STAFF_TEAM) == 4)), Name()),
  [Column("Name", Name()),
   Column("WCA ID", WcaId()),
   Column("Country", Country()),
   Column("Stage Lead", BooleanProperty(LISTED_DELEGATE)),
   Column("BLD Events", Length(Filter(RegisteredEvents(), Or(CompetingIn(_333bf), CompetingIn(_444bf), CompetingIn(_555bf), CompetingIn(_333mbf)))))])

Header("Team Sizes")
"Team 1"
Length(Persons((NumberProperty(STAFF_TEAM) == 1)))
"Team 2"
Length(Persons((NumberProperty(STAFF_TEAM) == 2)))
"Team 3"
Length(Persons((NumberProperty(STAFF_TEAM) == 3)))
"Team 4"
Length(Persons((NumberProperty(STAFF_TEAM) == 4)))
