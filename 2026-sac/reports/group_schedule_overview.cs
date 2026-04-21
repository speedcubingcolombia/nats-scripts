#include "../lib/_constants.cs"
#include "../lib/_rooms.cs"

# Cronograma de Grupos — Vista general del schedule
# Muestra todos los grupos de R1 y R2 en orden cronológico.

Header("Cronograma de grupos (R1 y R2)")
Table(
  Sort(Filter(AllGroups(), (RoundNumber(Round()) <= 2)),
       StartTime()),
  [Column("Evento", GroupName()),
   Column("Sala", Room()),
   Column("Inicio", StartTime()),
   Column("Fin", EndTime()),
   Column("Grupo #", GroupNumber())])
