#include "../lib/_constants.cs"

# Scramblers by Event — Who scrambles each event

Header("777")
Table(
  Sort(Persons(BooleanProperty("can-scramble-777")), Name()),
  [Column("Name", Name()),
   Column("Team", If(HasProperty(STAFF_TEAM), ToString(NumberProperty(STAFF_TEAM)), "—")),
   Column("Quality", If(HasProperty("scramble-quality-777"), ToString(NumberProperty("scramble-quality-777")), "—"))])

Header("666")
Table(
  Sort(Persons(BooleanProperty("can-scramble-666")), Name()),
  [Column("Name", Name()),
   Column("Team", If(HasProperty(STAFF_TEAM), ToString(NumberProperty(STAFF_TEAM)), "—")),
   Column("Quality", If(HasProperty("scramble-quality-666"), ToString(NumberProperty("scramble-quality-666")), "—"))])

Header("Square-1")
Table(
  Sort(Persons(BooleanProperty("can-scramble-sq1")), Name()),
  [Column("Name", Name()),
   Column("Team", If(HasProperty(STAFF_TEAM), ToString(NumberProperty(STAFF_TEAM)), "—")),
   Column("Quality", If(HasProperty("scramble-quality-sq1"), ToString(NumberProperty("scramble-quality-sq1")), "—"))])

Header("Clock")
Table(
  Sort(Persons(BooleanProperty("can-scramble-clock")), Name()),
  [Column("Name", Name()),
   Column("Team", If(HasProperty(STAFF_TEAM), ToString(NumberProperty(STAFF_TEAM)), "—")),
   Column("Quality", If(HasProperty("scramble-quality-clock"), ToString(NumberProperty("scramble-quality-clock")), "—"))])

Header("Megaminx")
Table(
  Sort(Persons(BooleanProperty("can-scramble-minx")), Name()),
  [Column("Name", Name()),
   Column("Team", If(HasProperty(STAFF_TEAM), ToString(NumberProperty(STAFF_TEAM)), "—")),
   Column("Quality", If(HasProperty("scramble-quality-minx"), ToString(NumberProperty("scramble-quality-minx")), "—"))])

Header("555")
Table(
  Sort(Persons(BooleanProperty("can-scramble-555")), Name()),
  [Column("Name", Name()),
   Column("Team", If(HasProperty(STAFF_TEAM), ToString(NumberProperty(STAFF_TEAM)), "—")),
   Column("Quality", If(HasProperty("scramble-quality-555"), ToString(NumberProperty("scramble-quality-555")), "—"))])

Header("444")
Table(
  Sort(Persons(BooleanProperty("can-scramble-444")), Name()),
  [Column("Name", Name()),
   Column("Team", If(HasProperty(STAFF_TEAM), ToString(NumberProperty(STAFF_TEAM)), "—"))])

Header("333")
Table(
  Sort(Persons(BooleanProperty("can-scramble-333")), Name()),
  [Column("Name", Name()),
   Column("Team", If(HasProperty(STAFF_TEAM), ToString(NumberProperty(STAFF_TEAM)), "—"))])

Header("Pyraminx")
Table(
  Sort(Persons(BooleanProperty("can-scramble-pyram")), Name()),
  [Column("Name", Name()),
   Column("Team", If(HasProperty(STAFF_TEAM), ToString(NumberProperty(STAFF_TEAM)), "—"))])

Header("Skewb")
Table(
  Sort(Persons(BooleanProperty("can-scramble-skewb")), Name()),
  [Column("Name", Name()),
   Column("Team", If(HasProperty(STAFF_TEAM), ToString(NumberProperty(STAFF_TEAM)), "—"))])

Header("222")
Table(
  Sort(Persons(BooleanProperty("can-scramble-222")), Name()),
  [Column("Name", Name()),
   Column("Team", If(HasProperty(STAFF_TEAM), ToString(NumberProperty(STAFF_TEAM)), "—"))])
