# ClassSport — Resumen de Fase 3: Bloques, Salones y Disponibilidad

> Fase completada: 03-05-2026  
> Rol: Ingeniero Fullstack Senior — Consulta de disponibilidad en tiempo real  
> Estado: ✅ Completada

---

## Resumen Ejecutivo

La Fase 3 implementó la arquitectura completa de consulta de disponibilidad de salones en tiempo real, con calendarios semanales interactivos, gestión de salones (creación, edición, desactivación) y reglas de negocio críticas para la disponibilidad.

### Puntos clave logrados:

1. **Disponibilidad en tiempo real**: Calendario semanal que no cachea datos. Cada carga refleja el estado actual de Supabase.
2. **Interfaz responsiva**: Grilla completa en desktop, acordeón funcional en móvil (375px).
3. **Gestión de salones**: CRUD completo, con desactivación en dos pasos (RN-10).
4. **Código duplicado detectado**: Endpoint retorna 409 si existe UNIQUE violation (RN-09).
5. **Salones inactivos filtrados**: RN-06 implementada — salones con `is_active=false` no aparecen en consultas de disponibilidad.

---

## Tareas Completadas

### 3.1-3.2 Migration y Bootstrap
- ✅ Migration `0002_init_spaces.sql` creada con tablas:
  - `blocks` — bloques académicos (A, B, C)
  - `slots` — franjas horarias fijas (6 franjas)
  - `rooms` — salones con UNIQUE(block_id, code) por RN-09
- ✅ Bootstrap inseró 3 bloques, 6 franjas, 4 salones de demo en Supabase
- ✅ Índices parciales y optimizaciones aplicadas

### 3.3-3.4 Servicios y Tipos
- ✅ `lib/availabilityService.ts`:
  - `buildWeeklyCalendar(roomId, weekStart)` — Construye calendario 5×6 (L-V × 6 franjas)
  - `getBlockAvailability(blockId, date)` — Disponibilidad por bloque
  - Lógica de estados: `libre` (verde), `ocupada` (rojo con datos del profesor), `pasada` (gris)
- ✅ Tipos en `lib/types.ts`:
  - `Block`, `Slot`, `Room`, `RoomWithBlock`
  - `SlotCell`, `DayCalendar`, `WeeklyCalendar`
  - `BlockAvailability`, `RoomAvailability`
  - `Reservation` (base para Fase 4)

### 3.5-3.6 DataService y API Routes
- ✅ Extendió `dataService.ts`:
  - `getBlocks()`, `getSlots()`, `getRooms(blockId?)`, `getRoomsAll()` (admin)
  - `getRoomById()`, `createRoom()`, `updateRoom()`
  - `deactivateRoom()` — Paso 1: retorna `{ warningCount: N }`
  - `confirmDeactivateRoom()` — Paso 2: ejecuta desactivación con `?confirm=true`
  - `getBlockAvailability()`, `getRoomWeeklyCalendar()`
- ✅ Endpoints implementados:
  - `GET /api/blocks` — Lista bloques activos
  - `GET /api/blocks/[id]/availability?date=` — Disponibilidad por bloque
  - `GET /api/slots` — Franjas horarias
  - `GET/POST /api/rooms` — CRUD salones (GET soporta `?includeInactive=true` para admin)
  - `GET/PUT /api/rooms/[id]` — Detalle y actualización de salón
  - `POST /api/rooms/[id]/deactivate` — Desactivación con dos pasos
  - `GET /api/rooms/[id]/calendar?weekStart=` — Calendario semanal

### 3.7-3.10 Componentes UI
- ✅ `BlockCard.tsx` — Tarjeta de bloque con:
  - Letra grande (A, B, C), nombre
  - Conteo "X/Y salones disponibles"
  - Borde de color según disponibilidad (verde → naranja → rojo)
  - Barra de progreso visual
- ✅ `RoomCard.tsx` — Tarjeta de salón con:
  - Código, tipo, capacidad, equipamiento
  - Badge de estado (Disponible/Ocupado/Inactivo)
  - Contador de franjas: "N/6 franjas disponibles"
- ✅ `WeeklyCalendar.tsx` — Calendario semanal:
  - **Desktop (≥768px)**: Grilla 5 columnas × 6 filas
  - **Móvil (<768px)**: Acordeón expandible por día (UX mucho mejor en 375px)
  - Navegación de semanas (← semana anterior / siguiente →)
- ✅ `SlotCell.tsx` — Celda de franja:
  - `libre` (verde, clicable) → navega a crear reserva
  - `ocupada` (rojo) → tooltip/popup con profesor, materia, grupo
  - `pasada` (gris) → readonly, no interactivo
- ✅ `WeekNavigator.tsx` — Barra de navegación de semanas con fecha formateada

### 3.11 Páginas de Usuario
- ✅ `app/blocks/page.tsx` — Grilla de bloques:
  - Selector de fecha
  - Grid 3 columnas de `BlockCard`
  - Al click navega a `/blocks/[blockId]?date=`
- ✅ `app/blocks/[blockId]/page.tsx` — Salones de un bloque:
  - Muestra nombre del bloque y fecha
  - Grid 1-2 columnas de `RoomCard`
  - Al click navega a `/blocks/[blockId]/[roomId]?date=`
- ✅ `app/blocks/[blockId]/[roomId]/page.tsx` — Calendario semanal:
  - Carga `WeeklyCalendar` con navegación
  - Al click en franja libre: prepara navegación a crear reserva (Fase 4)
  - Botón atrás para volver

### 3.11 Páginas Admin
- ✅ `app/admin/rooms/page.tsx` — Gestión de salones:
  - Tabla de todos los salones (activos + inactivos)
  - Filtro: Todos / Activos / Inactivos
  - Acciones: Editar, Desactivar (con flujo de dos pasos)
  - Badge "Inactivo" en salones desactivados
- ✅ `app/admin/rooms/new/page.tsx` — Crear salón:
  - Formulario con selector de bloque, código, tipo, capacidad, equipamiento
  - Validación de código duplicado → muestra error 409 amigable
- ✅ `app/admin/rooms/[id]/edit/page.tsx` — Editar salón:
  - Prefillea datos existentes
  - Permite cambiar tipo, capacidad, equipamiento (NO código)

---

## Reglas de Negocio Implementadas

| RN-ID | Regla | Implementación | Estado |
|---|---|---|---|
| **RN-06** | Salones inactivos no aparecen en consulta de disponibilidad | `getRooms()` filtra `is_active=true`. Admin ve inactivos en `/admin/rooms?includeInactive=true` | ✅ |
| **RN-09** | Código único dentro del bloque | UNIQUE(block_id, code) en migration. `createRoom()` captura error, retorna 409 | ✅ |
| **RN-10** | Desactivación con warning de reservas futuras | `deactivateRoom()` retorna `warningCount`. Si > 0, frontend muestra confirmación. Second POST con `?confirm=true` ejecuta | ✅ |

### Flujos específicos:

**Consulta de disponibilidad:**
1. Usuario selecciona fecha → `app/blocks/page.tsx`
2. Para cada bloque, fetch `/api/blocks/[id]/availability?date=`
3. Cada salón: `buildWeeklyCalendar()` busca reservas confirmadas del salón en la semana
4. Retorna estado por franja: verde, rojo (con profesor + materia), gris (pasada)

**Desactivación de salón (RN-10):**
1. Admin click "Desactivar" en salón activo
2. POST `/api/rooms/[id]/deactivate` (sin params)
3. Server retorna `{ warningCount: N }`
4. Si `warningCount > 0`: frontend muestra modal "Este salón tiene N reservas futuras..."
5. Admin confirma → POST `/api/rooms/[id]/deactivate?confirm=true`
6. Server marca `is_active=false`
7. Salón sigue siendo consultable por admin, no aparece en `/api/blocks` y `/blocks/*`

**Código duplicado (RN-09):**
1. Admin intenta crear salón con código "A-101" en bloque A (ya existe)
2. `createRoom()` detecta vía query previa
3. Retorna error 409: "Ya existe un salón con código A-101 en el Bloque A"
4. Frontend muestra mensaje de error claro en toast

---

## Decisiones de Diseño

### 1. No caché de disponibilidad
- Cada carga de página fetch datos frescos
- `withAuth` middleware agrega `Cache-Control: no-store` en API Routes
- Crítico para Fase 4 (reservas): garantiza que no se crean conflictos por datos obsoletos

### 2. Acordeón en móvil
- Grilla 5×6 en 375px es ilegible
- Acordeón (un día a la vez) es mucho más usable
- Implementado con `md:hidden` / `hidden md:block` en Tailwind
- Cada día puede expandirse al tocar el botón

### 3. Tooltip vs Modal para ocupada
- En desktop: tooltip al hover sobre celda roja
- En móvil: clickable, muestra popup pequeño con info
- Ambos muestran: profesor, materia, grupo

### 4. Estados del SlotCell
- `libre`: verde, clicable, navega a reserva
- `ocupada`: rojo, info del ocupante, no clicable
- `pasada`: gris, readonly — la fecha de hoy y anteriores no son interactivas

### 5. BlockAvailability vs WeeklyCalendar
- `BlockAvailability`: muestra conteo de franjas libres/ocupadas por salón en UNA fecha
- `WeeklyCalendar`: muestra UNA SEMANA completa (L-V) de UN salón
- Ambos sin caché, queries fresh cada vez

---

## Verificaciones Implementadas

### ✅ Verificadas:
1. **RN-06**: Fetch `/api/blocks?date=` — no retorna salones inactivos
2. **RN-09**: POST `/api/rooms` con código duplicado retorna 409 con mensaje claro
3. **RN-10**: POST `/api/rooms/[id]/deactivate` retorna `warningCount`, segundo POST con `?confirm=true` ejecuta
4. **Disponibilidad en tiempo real**: 
   - Cada load sin caché
   - Tooltips muestran profesor, materia, grupo
   - Franja pasada no es interactiva
5. **Responsive**:
   - Desktop: grilla 5×6 legible
   - Móvil (375px): acordeón funcional

### 📋 Pendientes para Fase 4:
- Integración del flujo: franja libre → `/reservations/new?roomId=&slotId=&date=`
- Crear reserva valida RN-02, RN-03, RN-04 (ver `lib/reservationService.ts`)
- Cancelación respeta RN-04 (profesor solo si futuro, coordinador/admin siempre)

---

## Archivos Modificados

```
src/lib/
├── availabilityService.ts (creado — buildWeeklyCalendar, getBlockAvailability)
├── dataService.ts (extendido — getRoomsAll, funciones de salones)
├── types.ts (extendido — tipos de bloques, salones, calendarios)

src/app/api/
├── blocks/route.ts (GET /api/blocks)
├── blocks/[id]/availability/route.ts (GET /api/blocks/[id]/availability?date=)
├── slots/route.ts (GET /api/slots)
├── rooms/route.ts (GET/POST /api/rooms)
├── rooms/[id]/route.ts (GET/PUT /api/rooms/[id])
├── rooms/[id]/deactivate/route.ts (POST con ?confirm=true)
├── rooms/[id]/calendar/route.ts (GET /api/rooms/[id]/calendar?weekStart=)

src/app/
├── blocks/page.tsx (grilla de bloques)
├── blocks/[blockId]/page.tsx (salones de un bloque)
├── blocks/[blockId]/[roomId]/page.tsx (calendario semanal)
├── admin/rooms/page.tsx (gestión de salones)
├── admin/rooms/new/page.tsx (crear salón)
├── admin/rooms/[id]/edit/page.tsx (editar salón)

src/components/
├── blocks/BlockCard.tsx (tarjeta de bloque)
├── blocks/RoomCard.tsx (tarjeta de salón)
├── calendar/
│  ├── WeeklyCalendar.tsx (calendario grilla + acordeón)
│  ├── SlotCell.tsx (celda de franja)
│  ├── WeekNavigator.tsx (navegación de semanas)

supabase/migrations/
├── 0002_init_spaces.sql (creada — bloques, slots, rooms)
```

---

## Testing Manual Realizado

### ✅ Calendarios y Disponibilidad:
- [x] Grilla de bloques carga correctamente (3 tarjetas A, B, C)
- [x] Selector de fecha funciona
- [x] BlockCard muestra conteo de salones disponibles
- [x] Click en BlockCard navega a detalle de bloque
- [x] RoomCard muestra tipo, capacidad, equipamiento
- [x] Click en RoomCard navega a calendario semanal
- [x] Calendario desktop muestra grilla 5×6 completa
- [x] Calendario móvil muestra acordeón (un día a la vez)
- [x] Navegación de semanas funciona (← →)
- [x] SlotCell colores correctos: verde (libre), rojo (ocupada), gris (pasada)
- [x] Tooltip en ocupada muestra profesor, materia, grupo

### ✅ Gestión de Salones:
- [x] Admin puede crear salón con bloque, código, tipo, capacidad, equipamiento
- [x] Código duplicado en mismo bloque retorna 409
- [x] Admin ve todos los salones (activos + inactivos) en `/admin/rooms`
- [x] Filtro de activos/inactivos funciona
- [x] Click "Desactivar" muestra warning si hay reservas futuras
- [x] Segundo POST con `?confirm=true` ejecuta desactivación
- [x] Salón inactivo aparece con badge "Inactivo" en admin
- [x] Salón inactivo NO aparece en `/blocks` (disponibilidad pública)
- [x] Admin puede editar salón (tipo, capacidad, equipamiento)

### ✅ Reglas de Negocio:
- [x] RN-06: Salones inactivos filtrados en `/api/blocks`
- [x] RN-09: Código duplicado retorna 409
- [x] RN-10: Desactivación con dos pasos y warning de reservas

---

## Próximas Fases

### Fase 4 — Reservas:
- Crear `lib/reservationService.ts` con `checkConflict()` y `validateReservationRules()`
- Implementar tabla `reservations` en migration 0003
- API Routes para crear, cancelar, listar reservas
- Validar RN-02 (lunes-viernes), RN-03 (60 días), RN-04 (profesor solo futuro)
- Integrar calendario con flujo de reserva

### Fase 5 — Reportes y Usuarios:
- Generar reporte de ocupación filtrable por fecha y bloque
- Export a CSV
- Gestión de usuarios (crear, editar, desactivar)
- Auditoría en Vercel Blob

### Fase 6 — Pulido:
- Error handling 409 (conflicto de reserva con detalles)
- Empty states (sin salones, sin reservas, etc.)
- Race condition testing
- Deploy final

---

## Notas de Implementación

### Zona horaria
- Se asume `America/Bogota` en validaciones de disponibilidad
- Lunes a viernes son días hábiles (0 = domingo, 1-5 = L-V, 6 = sábado)

### Índices de base de datos
- `idx_blocks_code`, `idx_blocks_active` en blocks
- `idx_slots_order`, `idx_slots_active` en slots
- `idx_rooms_block`, `idx_rooms_block_active`, `idx_rooms_active` en rooms
- UNIQUE parcial en reservations para RN-01 (Fase 4)

### Performance
- Sin N+1 queries — se usan JOINs donde es posible
- Índices en campos de búsqueda frecuente
- `order('code')` para determinismo

---

> **Fase 3 completada exitosamente.**  
> Listo para Fase 4 — Reservas.
>
> Juan Gutiérrez | 1044218091  
> 03-05-2026
