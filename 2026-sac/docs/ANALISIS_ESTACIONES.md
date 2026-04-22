# SAC 2026 — Análisis de Estaciones y Capacidad de Staff

## ¿Cuál es el problema?

Necesitamos decidir cuántas estaciones (jueces), scramblers y runners poner por grupo por zona. El límite no es físico — es la **cantidad de staff disponible**.

Cada grupo necesita:
- **1 juez por estación** (si hay 10 estaciones → 10 jueces)
- **Scramblers** (mezclan los puzzles)
- **Runners** (llevan puzzles entre competidores y scramblers)
- **1 delegado supervisor**

Todo ese staff sale de los **~24 miembros del equipo asignado a esa zona**. Pero esos mismos miembros también compiten — cuando les toca competir en un grupo, no pueden staffear ese grupo.

---

## Los números

### Staff total

| Concepto | Cantidad |
|----------|----------|
| Staff aprobado (Cargo en SAC2026-registration.xlsx) | 104 personas |
| Fuera del pool (overrides.cs) | 6 (Luigi, Klaus, Guido, Enrymar, Diego, Eduard) |
| Staff en teams | 99 personas |
| Equipos | 4 (25/25/25/24) |
| Team leads por equipo | 2 (solo supervisan, no son workers) |
| **Workers por equipo** | **~23** |

### ¿Cuántos workers hay disponibles por grupo?

Depende de cuántos del equipo están compitiendo en ese grupo.

**Ejemplo: 7x7 Ronda 1, Zona Roja, Grupo 1**

El Equipo 3 tiene la Zona Roja el día 1. De sus 25 miembros:
- 2 son team leads → solo supervisan
- De los 23 workers, **6 están compitiendo** en el Grupo 1
- Quedan **17 workers disponibles** para staffear

**Ejemplo: 3x3 Ronda 1, Zona Azul, Grupo 2**

El Equipo 2 tiene la Zona Azul el día 2. De sus 25 miembros:
- 2 team leads
- De los 23 workers, **3 están compitiendo** (menos gente porque 3x3 tiene más grupos)
- Quedan **20 workers disponibles**

### Estadísticas reales (calculadas sobre los 215 grupos en salas principales)

| Stat | Workers disponibles (equipo primario) |
|------|---------------------------------------|
| Mínimo | **14** |
| Percentil 10 | 16 |
| Mediana | 19 |
| Máximo | 22 |

El peor caso es **14 workers** (Square-1 R1 en Zona Azul — un evento pequeño donde muchos del equipo compiten a la vez).

---

## ¿Cuántas estaciones caben?

Cada configuración necesita una cantidad fija de workers:

| Estaciones | Scramblers | Runners | **Total workers** |
|------------|------------|---------|-------------------|
| 8 | 3 | 3 | 14 |
| 9 | 3 | 3 | 15 |
| **10** | **3** | **3** | **16** |
| 10 | 4 | 4 | 18 |
| 12 | 3 | 3 | 18 |
| 12 | 4 | 4 | 20 |
| 14 | 3 | 3 | 20 |
| 16 | 4 | 4 | 24 |

Con solo el equipo primario (mínimo 14 workers disponibles):

- **10+3+3 = 16**: Funciona en el 96% de los grupos. El 4% restante (8 grupos) necesita ayuda.
- **12+3+3 = 18**: El 31% de los grupos no alcanza con el equipo primario solo.
- **16+4+4 = 24**: Ningún grupo alcanza — siempre necesita ayuda.

---

## ¿Y el equipo flotante?

Cada día, 1 de los 4 equipos es "flotante" — no tiene zona fija. En teoría puede reforzar las zonas principales. Pero el flotante **no está libre**: tiene que cubrir BLD y eventos no oficiales.

### ¿Qué hace el flotante cada día?

| Día | Equipo flotante | Tareas BLD + No oficiales | Ocupados estimados |
|-----|-----------------|---------------------------|-------------------|
| Jun 12 | T4 | Mirror Blocks R1 | ~6 de 22 workers |
| Jun 13 | T1 | 5BLD + MBLD intento 1 + Kilominx R1 | ~10 de 22 workers |
| Jun 14 | T2 | MBLD intento 2 + 4BLD + Team BLD R1 + FTO R1 + finales | ~12 de 22 workers |
| Jun 15 | T3 | FTO Final + Team BLD Final | ~4 de 22 workers |

### ¿Cuántos flotantes quedan para reforzar?

Los que no estén en BLD/no oficiales se reparten entre las **3 zonas principales**:

| Día | Workers flotantes libres | Por zona (~÷3) |
|-----|-------------------------|-----------------|
| Jun 12 | ~16 | ~5 por zona |
| Jun 13 | ~12 | ~4 por zona |
| Jun 14 | ~10 | ~3 por zona |
| Jun 15 | ~18 | ~6 por zona |

**El día 14 es el cuello de botella** — el flotante está muy ocupado con BLD y no oficiales, dejando solo ~3 workers extra por zona.

---

## Tabla final: ¿qué configuración funciona?

Workers disponibles por grupo = equipo primario + flotante realista por zona.

| Config | Workers necesarios | Peor caso disponible | Margen | ¿Funciona? |
|--------|-------------------|---------------------|--------|------------|
| **10+3+3** | **16** | 18 | **+2** | **Sí, con margen** |
| 10+4+4 | 18 | 18 | +0 | Sí, justo |
| 12+3+3 | 18 | 18 | +0 | Sí, justo |
| 12+4+4 | 20 | 18 | **-2** | **No** |
| 14+3+3 | 20 | 18 | -2 | No |
| 16+3+3 | 22 | 18 | -4 | No |
| 16+4+4 | 24 | 18 | -6 | No |

---

## Resumen visual

```
Workers disponibles por grupo (peor caso):

Equipo primario:  ████████████████                    = 14-16
+ Flotante/zona:  ████████████████████                = 18 (día pesado) a 22 (día ligero)

Config 10+3+3:    ████████████████                    = 16 necesarios  ← CABE ✓
Config 12+3+3:    ██████████████████                  = 18 necesarios  ← JUSTO ✓
Config 16+4+4:    ████████████████████████████        = 24 necesarios  ← NO CABE ✗
```

---

## Opciones recomendadas

### Opción A: 10 estaciones + 3 scramblers + 3 runners (conservadora)
- El equipo primario casi siempre se basta solo (96% de los grupos)
- El flotante queda libre para BLD, no oficiales, y emergencias
- Margen de +2 workers en el peor caso

### Opción B: 12 estaciones + 3 scramblers + 3 runners (agresiva)
- 2 estaciones más por zona = competidores pasan más rápido
- El flotante SIEMPRE debe ayudar las zonas principales (31% de los grupos lo necesitan)
- Cero margen de error — si el flotante está ocupado en BLD, hay riesgo

### Opción C: 10 estaciones + 4 scramblers + 4 runners (más mezclas)
- Misma capacidad que Opción B (18 workers)
- Prioriza velocidad de scrambling sobre número de estaciones
- Mismos riesgos que Opción B
