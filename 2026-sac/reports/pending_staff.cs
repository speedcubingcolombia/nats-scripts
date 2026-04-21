#include "../lib/_constants.cs"

# Pendientes de Registro — Personas que aún no se registran en la competencia
# Útil para hacer seguimiento antes del cierre de registro.

Header("Competidores sin WCA ID (primera vez)")
Table(
  Persons(And(Registered(), IsNull(WcaId()))),
  [Column("Nombre", Name()),
   Column("País", Country()),
   Column("Eventos", Length(RegisteredEvents())),
   Column("Staff", Or(HasProperty(VOLUNTEER), HasProperty(STAGE_LEAD)))])

Header("Delegados pendientes de registro")
"2009GARC02 (Full), 2015TRIG02 (Full)"
"2015BALD03 (Regional)"
"2017PERE38, 2023SILV92 (Trainee)"
"Felipe Rojas Garces (CL, Junior)"

Header("Voluntarios pendientes de registro")
"2025BELT01, 2022LIZA02, 2025MONG07, 2024SUAR10"
"2015RODR37, 2025CARD14, 2025FAND01, 2025DELG07"
