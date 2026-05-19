#include "../lib/_constants.cs"
#include "../lib/_rooms.cs"

# Competitors by Group — Who competes in each group (R1 only)

Header("777 Round 1")
Table(
  Sort(Filter(Persons(CompetingIn(_777)), true), Name()),
  [Column("Name", Name()),
   Column("Group", AssignedGroup(_777-r1)),
   Column("Country", Country())])

Header("666 Round 1")
Table(
  Sort(Filter(Persons(CompetingIn(_666)), true), Name()),
  [Column("Name", Name()),
   Column("Group", AssignedGroup(_666-r1)),
   Column("Country", Country())])

Header("Megaminx Round 1")
Table(
  Sort(Filter(Persons(CompetingIn(_minx)), true), Name()),
  [Column("Name", Name()),
   Column("Group", AssignedGroup(_minx-r1)),
   Column("Country", Country())])

Header("Square-1 Round 1")
Table(
  Sort(Filter(Persons(CompetingIn(_sq1)), true), Name()),
  [Column("Name", Name()),
   Column("Group", AssignedGroup(_sq1-r1)),
   Column("Country", Country())])

Header("Clock Round 1")
Table(
  Sort(Filter(Persons(CompetingIn(_clock)), true), Name()),
  [Column("Name", Name()),
   Column("Group", AssignedGroup(_clock-r1)),
   Column("Country", Country())])

Header("555 Round 1")
Table(
  Sort(Filter(Persons(CompetingIn(_555)), true), Name()),
  [Column("Name", Name()),
   Column("Group", AssignedGroup(_555-r1)),
   Column("Country", Country())])

Header("444 Round 1")
Table(
  Sort(Filter(Persons(CompetingIn(_444)), true), Name()),
  [Column("Name", Name()),
   Column("Group", AssignedGroup(_444-r1)),
   Column("Country", Country())])

Header("Skewb Round 1")
Table(
  Sort(Filter(Persons(CompetingIn(_skewb)), true), Name()),
  [Column("Name", Name()),
   Column("Group", AssignedGroup(_skewb-r1)),
   Column("Country", Country())])

Header("333 Round 1")
Table(
  Sort(Filter(Persons(CompetingIn(_333)), true), Name()),
  [Column("Name", Name()),
   Column("Group", AssignedGroup(_333-r1)),
   Column("Country", Country())])

Header("333 BLD Round 1")
Table(
  Sort(Filter(Persons(CompetingIn(_333bf)), true), Name()),
  [Column("Name", Name()),
   Column("Group", AssignedGroup(_333bf-r1)),
   Column("Country", Country())])

Header("333 OH Round 1")
Table(
  Sort(Filter(Persons(CompetingIn(_333oh)), true), Name()),
  [Column("Name", Name()),
   Column("Group", AssignedGroup(_333oh-r1)),
   Column("Country", Country())])

Header("222 Round 1")
Table(
  Sort(Filter(Persons(CompetingIn(_222)), true), Name()),
  [Column("Name", Name()),
   Column("Group", AssignedGroup(_222-r1)),
   Column("Country", Country())])

Header("Pyraminx Round 1")
Table(
  Sort(Filter(Persons(CompetingIn(_pyram)), true), Name()),
  [Column("Name", Name()),
   Column("Group", AssignedGroup(_pyram-r1)),
   Column("Country", Country())])
