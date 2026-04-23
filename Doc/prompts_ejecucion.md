# ⚡ ClassSport — Prompts de Ejecución

> Prompts secuenciales para desarrollar ClassSport completo en VS Code.
> Deploy destino: **Vercel**. Ejecutar en orden. Cada prompt es autocontenido.

---

## � Resumen de Ejecución

| Prompt | Descripción | Estado | Fecha | Archivos |
|--------|-------------|--------|-------|----------|
| **Prompt 1** | Setup & Infraestructura Base | ✅ COMPLETADO | 2026-04-23 | 24+ archivos |
| **Prompt 2** | Backend Core (APIs CRUD) | ✅ COMPLETADO | 2026-04-23 | 10 archivos |
| **Prompt 3** | Frontend Core (Componentes UI) | ⏳ Pendiente | — | — |
| **Prompt 4** | Admin Dashboard Completo | ⏳ Pendiente | — | — |
| **Prompt 5** | Testing & Optimizaciones | ⏳ Pendiente | — | — |

**Progreso:** `████░░░░░░` 40% (2/5 prompts completados)

---

## ✅ PROMPT 1 — COMPLETADO

**Fecha:** 2026-04-23  
**Archivos Generados:** 24  
**Líneas de Código:** 2000+

### Archivos Creados:

**Configuración:**
- ✅ `package.json` - 19 dependencias
- ✅ `tsconfig.json` - TypeScript strict mode
- ✅ `next.config.js` - Next.js config
- ✅ `tailwind.config.ts` - Tema personalizado
- ✅ `postcss.config.js` - PostCSS + Autoprefixer
- ✅ `.eslintrc.json` - ESLint config
- ✅ `.gitignore` - Git exclusions
- ✅ `.env.local.example` - Variables template

**Base de Datos:**
- ✅ `prisma/schema.prisma` - 6 modelos
- ✅ `prisma/seed.ts` - Seed con 32+ registros

**Autenticación:**
- ✅ `src/lib/auth.ts` - NextAuth.js v5
- ✅ `src/middleware.ts` - RBAC middleware
- ✅ `src/app/api/auth/[...nextauth]/route.ts` - Handlers

**Páginas:**
- ✅ `src/app/page.tsx` - Home
- ✅ `src/app/login/page.tsx` - Login
- ✅ `src/app/dashboard/page.tsx` - Dashboard
- ✅ `src/app/admin/page.tsx` - Admin panel

**Estilos y Utilidades:**
- ✅ `src/app/layout.tsx` - Root layout
- ✅ `src/app/globals.css` - Global styles
- ✅ `src/lib/utils.ts` - Utilidades
- ✅ `src/lib/prisma.ts` - Prisma singleton
- ✅ `src/lib/query-client.ts` - React Query

**Tipos y Componentes:**
- ✅ `src/types/index.ts` - Tipos globales
- ✅ `src/components/admin-layout.tsx` - Admin layout

**Documentación:**
- ✅ `README.md` - Documentación
- ✅ `SETUP_GUIDE.md` - Guía setup
- ✅ `IMPLEMENTACION_COMPLETA.md` - Resumen
- ✅ `VERIFICACION.md` - Checklist
- ✅ `COMANDOS_SETUP.md` - Comandos exactos

### Características Implementadas:

✅ **Autenticación:**
- NextAuth.js v5 con Credentials Provider
- Bcryptjs password hashing
- JWT tokens (30 días)
- Session management

✅ **Autorización (RBAC):**
- Roles: ADMIN, COORDINADOR, PROFESOR
- Middleware de protección
- Redirección inteligente

✅ **Base de Datos:**
- 6 modelos Prisma
- Relaciones con cascadas
- Constraint UNIQUE
- Timestamps automáticos

✅ **Datos de Prueba:**
- 3 bloques (A, B, C)
- 12 salones
- 8 franjas horarias
- 5 usuarios
- 5 reservas

✅ **UI/UX:**
- Tailwind CSS + colores universitarios
- Componentes responsive
- Modo oscuro soportado
- Animaciones

✅ **Configuración Completa:**
- TypeScript strict
- Next.js App Router
- ESLint
- Path aliases
- Validación Zod

### Credenciales de Prueba:

```
ADMIN:
  Email: admin@classsport.edu
  Password: Admin123!

COORDINADOR:
  Email: coordinador@classsport.edu
  Password: Prof123!

PROFESORES:
  prof1@classsport.edu / Prof123!
  prof2@classsport.edu / Prof123!
  prof3@classsport.edu / Prof123!
```

---

## ✅ PROMPT 2 — COMPLETADO

**Fecha:** 2026-04-23  
**Archivos Generados:** 10  
**Líneas de Código:** 1500+  
**Endpoints Implementados:** 12

### Archivos Creados:

**Utilidades y Schemas:**
- ✅ `src/lib/api-helpers.ts` - 15+ funciones helper
- ✅ `src/lib/api-schemas.ts` - 7 esquemas Zod

**Rutas API — Bloques:**
- ✅ `src/app/api/bloques/route.ts` - GET todos
- ✅ `src/app/api/bloques/[id]/route.ts` - GET detalle
- ✅ `src/app/api/bloques/[id]/salones/route.ts` - GET salones con disponibilidad

**Rutas API — Salones:**
- ✅ `src/app/api/salones/route.ts` - GET con filtros/paginación
- ✅ `src/app/api/salones/[id]/route.ts` - GET, PUT, DELETE
- ✅ `src/app/api/salones/[id]/horario/route.ts` - GET disponibilidad (día + semana)

**Rutas API — Franjas y Admin:**
- ✅ `src/app/api/franjas/route.ts` - GET franjas
- ✅ `src/app/api/admin/salones/route.ts` - POST crear salón

**Documentación:**
- ✅ `API_DOCUMENTATION.md` - 500+ líneas completa

### Endpoints Implementados (12 total):

#### Bloques (3):
- GET `/api/bloques` - Lista con count
- GET `/api/bloques/[id]` - Detalle
- GET `/api/bloques/[id]/salones` - Con disponibilidad

#### Salones (6):
- GET `/api/salones` - Con filtros y paginación
- GET `/api/salones/[id]` - Detalle completo
- PUT `/api/salones/[id]` - Actualizar (admin)
- DELETE `/api/salones/[id]` - Soft delete (admin)
- GET `/api/salones/[id]/horario` - Disponibilidad día
- GET `/api/salones/[id]/horario?semana=` - Disponibilidad semana

#### Franjas y Admin (3):
- GET `/api/franjas` - Lista ordenada
- POST `/api/admin/salones` - Crear salón (admin)

### Características Destacadas:

✅ **API Helpers (15+ funciones):**
- Respuestas estandarizadas
- Autenticación y autorización
- Validación con Zod
- Manejo centralizado de errores
- Funciones de fechas

✅ **Disponibilidad Horaria:**
- Calcula slots ocupados vs disponibles
- Soporta consulta por día
- Soporta consulta por semana (lunes-viernes)
- Valida: no fin de semana, no >30 días
- Diferencia info profesor vs admin

✅ **Seguridad Completa:**
- Autenticación en todos los endpoints
- Autorización por rol
- Soft delete con validación
- Manejo centralizado de errores

✅ **Paginación y Caché:**
- Paginación: default 20, máximo 100
- Caché bloques: 5 minutos
- Caché franjas: 1 hora

### Códigos de Error (13):
UNAUTHORIZED, FORBIDDEN, BLOQUE_NOT_FOUND, SALON_NOT_FOUND, DUPLICATE_CODIGO, SALON_HAS_RESERVATIONS, INVALID_DATE, WEEKEND_NOT_ALLOWED, DATE_TOO_FAR, DATE_IN_PAST, MISSING_FECHA, VALIDATION_ERROR

### Características Implementadas:

✅ **Autenticación:**
- NextAuth.js v5 con Credentials Provider
- Bcryptjs password hashing
- JWT tokens (30 días)
- Session management

✅ **Autorización (RBAC):**
- Roles: ADMIN, COORDINADOR, PROFESOR
- Middleware de protección
- Redirección inteligente

✅ **Base de Datos:**
- 6 modelos Prisma
- Relaciones con cascadas
- Constraint UNIQUE
- Timestamps automáticos

✅ **Datos de Prueba:**
- 3 bloques (A, B, C)
- 12 salones
- 8 franjas horarias
- 5 usuarios
- 5 reservas

✅ **UI/UX:**
- Tailwind CSS + colores universitarios
- Componentes responsive
- Modo oscuro soportado
- Animaciones

✅ **Configuración Completa:**
- TypeScript strict
- Next.js App Router
- ESLint
- Path aliases
- Validación Zod

### Credenciales de Prueba:

```
ADMIN:
  Email: admin@classsport.edu
  Password: Admin123!

COORDINADOR:
  Email: coordinador@classsport.edu
  Password: Prof123!

PROFESORES:
  prof1@classsport.edu / Prof123!
  prof2@classsport.edu / Prof123!
  prof3@classsport.edu / Prof123!
```

### Próximos Pasos:

Los siguientes prompts agregarán:
1. **Prompt 2:** APIs CRUD completas para todos los modelos
2. **Prompt 3:** Componentes UI reutilizables (Tablas, Formularios, etc)
3. **Prompt 4:** Páginas administrativas funcionales
4. **Prompt 5:** Testing, optimizaciones y deployment

---

## �📌 Instrucciones de Uso

1. Abrir VS Code en la carpeta del proyecto
2. Copiar el prompt completo y ejecutarlo con Claude
3. Después de cada prompt, Claude actualizará `Doc.md` y `estado_ejecucion.md`
4. No saltar prompts — cada uno depende del anterior

---

### Prompt 1: Setup & Infraestructura Base

**Descripción:**
Crea el proyecto Next.js 14 completo con toda la configuración inicial necesaria para ClassSport. Incluye configuración de TypeScript, Tailwind CSS, shadcn/ui, Prisma ORM con Vercel Postgres, NextAuth.js para autenticación con roles, middleware de protección de rutas y seed de datos de ejemplo.

**Prompt a ejecutar:**

```
Eres un arquitecto fullstack senior. Vamos a construir ClassSport: una plataforma de gestión de salones universitarios.

STACK: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Prisma + Vercel Postgres + NextAuth.js v5

TAREA: Genera TODOS los archivos necesarios para el setup inicial del proyecto.

1. **package.json** con todas las dependencias:
   - next@14, react, react-dom, typescript
   - @prisma/client, prisma
   - next-auth@5 (beta)
   - @vercel/postgres
   - tailwindcss, postcss, autoprefixer
   - @shadcn/ui base
   - zod, react-hook-form, @hookform/resolvers
   - date-fns
   - react-hot-toast
   - @tanstack/react-query

2. **prisma/schema.prisma** con estas entidades COMPLETAS:
   - Usuario (id, nombre, email, passwordHash, rol: enum PROFESOR|ADMIN|COORDINADOR, departamento, activo, timestamps)
   - Bloque (id, nombre: A/B/C, descripcion, activo)
   - Salon (id, bloqueId FK, codigo: "A-101", nombre, capacidad, tipo: enum AULA|LABORATORIO|AUDITORIO|SALA_SISTEMAS, equipamiento: Json, activo)
   - HoraFranja (id, horaInicio, horaFin, etiqueta, orden)
   - Reserva (id, salonId FK, usuarioId FK, franjaId FK, fecha: Date, materia, grupo, observaciones, estado: enum PENDIENTE|CONFIRMADA|CANCELADA, timestamps)
   - Añadir constraint UNIQUE en Reserva para (salonId, franjaId, fecha)

3. **prisma/seed.ts** con datos de prueba:
   - Bloque A, B, C
   - 4 salones por bloque (A-101 al A-104, etc.)
   - 8 franjas horarias: 07:00-08:00, 08:00-09:00... hasta 14:00-15:00
   - 1 usuario admin: admin@classsport.edu / password: Admin123!
   - 3 usuarios profesores: prof1@, prof2@, prof3@ / password: Prof123!
   - 5 reservas de ejemplo distribuidas

4. **src/lib/auth.ts** — Configuración NextAuth.js v5:
   - Credentials provider con validación de email/password + bcrypt
   - Session con datos: id, nombre, email, rol
   - JWT callbacks para incluir rol en token
   - Exportar: auth, signIn, signOut, handlers

5. **src/middleware.ts** — Protección de rutas:
   - Rutas públicas: /login, /api/auth/*
   - Rutas admin: /admin/* solo para ADMIN y COORDINADOR
   - Resto: requiere autenticación
   - Redirect a /login si no autenticado

6. **.env.local.example** con todas las variables necesarias:
   POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING
   NEXTAUTH_SECRET, NEXTAUTH_URL
   
7. **src/lib/prisma.ts** — Singleton de Prisma Client

8. **src/lib/utils.ts** — Utilidades: cn() de shadcn, formatDate, formatTime

9. **tailwind.config.ts** y **src/app/globals.css** con design tokens de ClassSport:
   - Colores primarios: azul universitario (#1e40af), verde disponible (#16a34a), rojo ocupado (#dc2626)
   - Fuente: Inter para cuerpo, tema claro/oscuro

10. **src/app/layout.tsx** — Root layout con:
    - Providers: SessionProvider, QueryClientProvider, Toaster
    - Metadata del sitio

11. **src/types/index.ts** — Tipos TypeScript globales del proyecto

Genera TODOS los archivos completos con código real y funcional. No uses placeholders. Al final incluye los comandos exactos para:
- Instalar dependencias
- Configurar Vercel Postgres localmente  
- Correr migraciones y seed
- Iniciar dev server
```

**Entregable esperado:**
- Proyecto Next.js corriendo en `localhost:3000`
- Login funcional con usuarios demo
- DB con estructura completa y datos de prueba
- Deploy inicial en Vercel funcionando

---

### Prompt 2: Backend — APIs de Bloques, Salones y Franjas

**Descripción:**
Desarrolla todas las API Routes de Next.js para la estructura base: bloques, salones y franjas horarias. Incluye validación con Zod, manejo de errores centralizado y documentación inline.

**Prompt a ejecutar:**

```
Continuamos con ClassSport. El setup de Fase 1 está completo.

CONTEXTO: Next.js 14 App Router, Prisma + Vercel Postgres, TypeScript, Zod, NextAuth.js v5. Los schemas y tipos ya están definidos.

TAREA: Genera las API Routes para la estructura base del sistema.

1. **src/lib/api-helpers.ts** — Utilidades compartidas para APIs:
   - successResponse(data, status?) — retorna NextResponse JSON estandarizado
   - errorResponse(message, status) — retorna error JSON estandarizado
   - requireAuth(request) — verifica sesión activa, retorna usuario o lanza 401
   - requireRole(request, roles[]) — verifica rol, lanza 403 si no tiene permiso
   - validateBody(schema, body) — valida con Zod, retorna data tipada o lanza 400

2. **src/app/api/bloques/route.ts** — GET /api/bloques:
   - Lista todos los bloques activos
   - Incluye count de salones activos por bloque
   - Requiere autenticación
   - Cache: revalidate 300s (cambia raramente)

3. **src/app/api/bloques/[id]/route.ts** — GET /api/bloques/[id]:
   - Detalle de un bloque con sus salones activos
   - Incluye equipamiento de cada salón

4. **src/app/api/bloques/[id]/salones/route.ts** — GET /api/bloques/[id]/salones:
   - Lista salones de un bloque
   - Query param opcional: ?fecha=YYYY-MM-DD para incluir disponibilidad del día
   - Si fecha está presente, agrega campo "slotsDisponibles" y "slotsOcupados" a cada salón

5. **src/app/api/salones/route.ts** — GET /api/salones (admin only):
   - Lista todos los salones con bloque, paginación (page, limit)
   - Filtros: ?bloqueId=, ?tipo=, ?activo=

6. **src/app/api/salones/[id]/route.ts** — GET, PUT, DELETE /api/salones/[id]:
   - GET: Detalle completo del salón
   - PUT: Admin puede editar (nombre, capacidad, equipamiento, activo) — validar con Zod
   - DELETE: Soft delete (activo=false), solo si no tiene reservas futuras

7. **src/app/api/salones/[id]/horario/route.ts** — GET /api/salones/[id]/horario:
   - Query params: fecha=YYYY-MM-DD (requerido), semana=true (opcional, retorna 5 días)
   - Retorna: array de franjas horarias con estado (LIBRE|OCUPADO) y si OCUPADO: {profesor, materia, grupo}
   - Profesores solo ven ocupado/libre; admin ve info completa
   - Valida que fecha no sea fin de semana
   - Valida que fecha no sea más de 30 días en el futuro

8. **src/app/api/franjas/route.ts** — GET /api/franjas:
   - Lista todas las franjas horarias ordenadas por horaInicio
   - Cache: revalidate 3600s

9. **src/app/api/admin/salones/route.ts** — POST /api/admin/salones (admin only):
   - Crear nuevo salón
   - Validar: codigo único dentro del bloque, capacidad > 0
   - Schema Zod: { bloqueId, codigo, nombre, capacidad, tipo, equipamiento }

Formato de respuesta estandarizado para TODAS las rutas:
{
  "success": true,
  "data": {...},
  "meta": { "total": N, "page": N } // solo en listas
}

Error:
{
  "success": false,
  "error": "Mensaje descriptivo",
  "code": "SALON_NOT_FOUND" // código de error específico
}

Genera todos los archivos completos con código TypeScript real. Incluye comentarios JSDoc en funciones principales.
```

**Entregable esperado:**
- 9 API Routes funcionales y probadas con Thunder Client/curl
- Validación de inputs en todas las rutas
- Errores HTTP correctos (400, 401, 403, 404, 409, 500)
- Formato de respuesta consistente

---

### Prompt 3: Backend — Sistema de Reservas con Anti-Conflictos

**Descripción:**
Implementa el core del negocio: API de reservas con prevención de conflictos usando transacciones de base de datos, caché Redis y notificaciones.

**Prompt a ejecutar:**

```
Continuamos con ClassSport. APIs base completadas en Prompt 2.

TAREA: Implementa el sistema completo de reservas — el core del negocio.

1. **src/lib/reservas-service.ts** — Servicio de negocio:
   
   async function crearReserva(data: CrearReservaInput): Promise<Reserva>
   - Usa transacción Prisma con isolation level SERIALIZABLE
   - SELECT para verificar disponibilidad DENTRO de la transacción
   - Si slot ocupado: lanza ConflictoReservaError con detalle
   - INSERT de la reserva
   - Invalida caché Redis del salón para esa fecha
   
   async function cancelarReserva(reservaId: string, usuarioId: string, rol: Rol): Promise<void>
   - Verificar que profesor solo cancele sus propias reservas
   - Admin puede cancelar cualquiera
   - Solo cancelar si estado es PENDIENTE o CONFIRMADA
   - No cancelar si la reserva es hoy o en el pasado
   - Actualizar estado a CANCELADA
   
   async function obtenerHorarioSalon(salonId: string, fecha: Date): Promise<FranjaConEstado[]>
   - Buscar en caché Redis primero (key: "horario:{salonId}:{fecha}")
   - Si miss: query a DB, guardar en caché con TTL 60 segundos
   - Retorna array de todas las franjas con su estado

2. **src/lib/redis.ts** — Cliente Redis (Vercel KV):
   - Configurar cliente @vercel/kv
   - Funciones: getCache(key), setCache(key, value, ttlSeconds), invalidateCache(key)
   - Pattern: invalidarHorarioSalon(salonId, fecha) — invalida keys relacionadas

3. **src/app/api/reservas/route.ts** — POST /api/reservas + GET /api/reservas:
   
   POST — Crear reserva:
   - Body: { salonId, franjaId, fecha, materia, grupo, observaciones? }
   - Validar con Zod: fecha válida, no fin de semana, no pasado, no > 60 días futuro
   - Llamar a crearReserva() del servicio
   - Si ConflictoReservaError → 409 con mensaje claro
   - Si éxito → 201 con reserva creada
   
   GET — Mis reservas:
   - Para profesores: sus reservas con filtros ?estado=, ?fecha=, ?salonId=
   - Ordenar por fecha DESC
   - Paginación: ?page=1&limit=20
   - Incluir: salon.codigo, salon.bloque.nombre, franja.etiqueta

4. **src/app/api/reservas/[id]/route.ts** — GET, DELETE /api/reservas/[id]:
   - GET: Detalle de reserva (solo si es del usuario o admin)
   - DELETE: Cancelar reserva usando cancelarReserva() del servicio

5. **src/app/api/admin/reservas/route.ts** — GET (admin only):
   - Todas las reservas del sistema
   - Filtros: ?salonId=, ?usuarioId=, ?fecha=, ?estado=, ?bloqueId=
   - Incluir: usuario.nombre, salon.codigo, franja.etiqueta, bloque.nombre
   - Export: ?formato=json|csv (para descarga)

6. **src/lib/rate-limit.ts** — Rate limiting:
   - Usando Vercel KV: max 10 creaciones de reserva por usuario por hora
   - Si excede: retorna 429 Too Many Requests con Retry-After header

7. **src/app/api/admin/reservas/[id]/route.ts** — PUT (admin only):
   - Permite a admin cambiar estado de reserva manualmente
   - Body: { estado: 'CONFIRMADA' | 'CANCELADA', motivo? }

Manejo de errores a implementar:
- ConflictoReservaError (409): "El salón A-101 ya está reservado el 2025-04-23 de 08:00 a 09:00 por Prof. García - Matemáticas I"
- FranjaNoDisponibleError (422): "La franja seleccionada no es válida para este horario"
- ReservaNoModificableError (403): "No puedes cancelar reservas de otros profesores"

Usa @vercel/kv para Redis. Si no está disponible, usa un Map en memoria como fallback para dev.
```

**Entregable esperado:**
- Sistema de reservas sin conflictos garantizado por transacciones DB
- Caché Redis funcionando
- Mensajes de error descriptivos y útiles
- Rate limiting activo

---

### Prompt 4: Frontend — UI Core y Flujo de Reservas

**Descripción:**
Desarrolla toda la interfaz de usuario: login, dashboard, vista de bloques/salones y el flujo completo de reserva con calendario semanal interactivo.

**Prompt a ejecutar:**

```
Continuamos con ClassSport. Backend completo. Ahora el frontend.

STACK UI: Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, React Query, date-fns

DESIGN SYSTEM de ClassSport:
- Primary: azul #1e40af (universitario, confianza)
- Success/Libre: verde #16a34a  
- Danger/Ocupado: rojo #dc2626
- Neutral/NoDisponible: gris #9ca3af
- Fondo: blanco #ffffff, gris claro #f8fafc
- Fuente: Inter (Google Fonts)
- Bordes redondeados: rounded-lg (8px)
- Sombras sutiles en cards

TAREA: Genera todos los componentes y páginas del frontend.

1. **src/components/providers.tsx** — Providers wrapper:
   - SessionProvider, QueryClientProvider (React Query), ReactQueryDevtools en dev

2. **src/app/(auth)/login/page.tsx** — Página de login:
   - Logo + nombre ClassSport
   - Form: email, password con validación react-hook-form + Zod
   - Botón de ingreso con loading state
   - Manejo de error: "Credenciales incorrectas"
   - Redirect automático a /dashboard si ya autenticado
   - Diseño: card centrada, fondo con patrón sutil

3. **src/app/(dashboard)/layout.tsx** — Layout autenticado:
   - Sidebar fijo (desktop): logo, nav links, info usuario, logout
   - Navbar móvil: hamburger menu
   - Nav links: Dashboard, Bloques, Mis Reservas, (Admin: Gestión)
   - Indicador de rol del usuario (badge)

4. **src/app/(dashboard)/dashboard/page.tsx** — Dashboard home:
   - Saludo: "Buen día, [nombre]"
   - 3 cards de métricas: Mis reservas hoy / Esta semana / Este mes
   - Grid de 3 cards de bloques: Bloque A, B, C con disponibilidad del día
   - Tabla: "Mis próximas reservas" (5 más recientes)
   - Botón prominente: "Nueva Reserva"

5. **src/app/(dashboard)/bloques/page.tsx** — Selección de bloque:
   - Datepicker para elegir fecha (default: hoy, no permite fines de semana)
   - 3 cards grandes: Bloque A, B, C
   - Cada card: nombre, descripción, total salones, salones disponibles HOY (badge verde/rojo)
   - Click → /bloques/[id]?fecha=YYYY-MM-DD

6. **src/app/(dashboard)/bloques/[id]/page.tsx** — Salones del bloque:
   - Header: "Bloque A — 4 salones disponibles"
   - Datepicker de fecha (hereda de query param)
   - Grid de SalonCards

7. **src/components/salon-card.tsx** — Card de salón:
   - Código del salón (A-101), nombre, capacidad, tipo
   - Badges de equipamiento (proyector, AC, etc.)
   - Indicador de disponibilidad: X/8 franjas libres
   - Barra de progreso de ocupación
   - Click → /salones/[id]?fecha=

8. **src/app/(dashboard)/salones/[id]/page.tsx** — Vista de salón:
   - Info del salón (código, bloque, capacidad, equipamiento)
   - CalendarioSemanal con navegación semana anterior/siguiente

9. **src/components/calendario-semanal.tsx** — Componente principal ⭐:
   - Grid: columnas = días de la semana (Lun-Vie), filas = franjas horarias (8)
   - Celda LIBRE: verde claro, cursor pointer, hover con sombra
   - Celda OCUPADA: rojo claro, cursor not-allowed, tooltip: "Prof. García - Matemáticas I"
   - Celda hoy: borde azul destacado
   - Celda pasada (hora ya transcurrió): gris oscuro, no clickeable
   - Click en LIBRE → abre ModalReserva
   - Loading skeleton mientras carga
   - React Query: refetch automático cada 60s

10. **src/components/modal-reserva.tsx** — Modal de confirmación:
    - Muestra resumen: Salón, Fecha, Franja horaria
    - Inputs: Materia (text, requerido), Grupo (text, ej: "G-01"), Observaciones (opcional)
    - Botones: Cancelar / Confirmar Reserva
    - Loading state en botón de confirmar
    - Al confirmar: mutación React Query → toast éxito/error → cierra modal → refresca calendario

11. **src/app/(dashboard)/mis-reservas/page.tsx** — Historial de reservas:
    - Filtros: estado (tabs), fecha desde/hasta
    - Tabla: Fecha | Salón | Bloque | Franja | Materia | Grupo | Estado | Acciones
    - Acción: Cancelar (solo reservas futuras con estado activo)
    - Paginación
    - Badge de color por estado (Confirmada=verde, Cancelada=gris, Pendiente=amarillo)

12. **src/hooks/use-reservas.ts** — Custom hooks con React Query:
    - useHorarioSalon(salonId, fecha) — GET horario
    - useCrearReserva() — mutation POST
    - useCancelarReserva() — mutation DELETE
    - useMisReservas(filtros) — GET paginado
    - useBloques() — GET bloques

Asegúrate que todos los componentes sean:
- Completamente responsivos (mobile-first)
- Con loading skeletons (Skeleton de shadcn)
- Con estados de error y vacío
- Accesibles (aria-labels, focus management en modales)
```

**Entregable esperado:**
- Flujo completo usuario: login → dashboard → reservar → ver mis reservas
- Calendario semanal interactivo con estados visuales claros
- Responsive en mobile y desktop
- React Query cacheando y revalidando datos

---

### Prompt 5: Panel Admin y Funciones Avanzadas

**Descripción:**
Implementa el panel de administración con vista global de salones, gestión de usuarios y generación de reportes.

**Prompt a ejecutar:**

```
Continuamos con ClassSport. Frontend de profesores completo.

TAREA: Implementa el panel administrativo completo.

1. **src/app/(dashboard)/admin/page.tsx** — Dashboard Admin:
   - Métricas globales: Total reservas hoy / Tasa de ocupación % / Salones activos / Usuarios activos
   - Gráfico simple: ocupación por bloque (barras con CSS puro o recharts)
   - Tabla: "Últimas 10 reservas del sistema" con acción de cancelar
   - Quick actions: Crear salón, Ver reporte, Gestionar usuarios

2. **src/app/(dashboard)/admin/vista-global/page.tsx** — Vista global ⭐:
   - Selector de fecha (datepicker)
   - Tabs por bloque: Bloque A | Bloque B | Bloque C
   - Por cada bloque: tabla donde filas=salones, columnas=franjas horarias
   - Cada celda: Libre (verde) | Ocupado con nombre del profesor (rojo) | No disponible (gris)
   - Admin puede click en cualquier celda libre para reservar en nombre de alguien
   - Admin puede click en celda ocupada para ver detalle y opción de cancelar

3. **src/app/(dashboard)/admin/salones/page.tsx** — Gestión de salones:
   - Tabla con todos los salones: código, bloque, tipo, capacidad, estado activo/inactivo
   - Filtros: bloque, tipo, estado
   - Botón "Nuevo Salón" → modal de creación
   - Acciones: Editar (modal), Desactivar/Activar (toggle)

4. **src/app/(dashboard)/admin/salones/[id]/editar/page.tsx** — Editar salón:
   - Form prellenado con datos actuales
   - Campos: nombre, capacidad, tipo, equipamiento (checkboxes: proyector, AC, tablero, computadores)
   - Guardar cambios con validación

5. **src/app/(dashboard)/admin/usuarios/page.tsx** — Gestión de usuarios:
   - Tabla: nombre, email, rol, departamento, estado
   - Filtros: rol, estado
   - Acciones: Cambiar rol (dropdown), Activar/Desactivar
   - Botón "Nuevo Usuario" → modal con form (nombre, email, password temporal, rol, departamento)

6. **src/app/(dashboard)/admin/reportes/page.tsx** — Reportes:
   - Filtros: rango de fechas, bloque, salón, usuario
   - Tabla de reservas con todos los campos
   - Botón "Exportar CSV" que llama a /api/admin/reservas?formato=csv
   - Resumen: total reservas, horas de uso, salón más usado

7. **src/components/admin/reservation-table.tsx** — Tabla de reservas admin:
   - Columnas: Fecha, Franja, Salón, Bloque, Profesor, Materia, Grupo, Estado, Acciones
   - Cancelación inline con confirmación
   - Ordenamiento por columnas

8. **src/components/admin/stats-card.tsx** — Card de estadística:
   - Ícono, título, valor numérico, variación % vs ayer/semana
   - Colores según tendencia (verde=mejor, rojo=peor)

Proteger TODAS las rutas /admin/* con verificación de rol (middleware ya lo hace, pero añadir verificación en cada page también).

Para el "Exportar CSV" genera el CSV en el frontend con los datos que ya tienes en React Query (sin llamada extra al servidor), usando esta función:

function exportToCSV(data: Reserva[], filename: string): void {
  // Genera y descarga CSV directamente en el browser
}
```

**Entregable esperado:**
- Panel admin completo con vista global de todos los salones
- CRUD de salones y gestión de usuarios
- Exportación de reportes CSV
- Diferenciación visual clara entre rol profesor y admin

---

### Prompt 6: Testing, Optimizaciones y Deploy a Producción

**Descripción:**
Implementa tests end-to-end, optimizaciones de rendimiento, configuración de seguridad final y deploy completo a producción en Vercel.

**Prompt a ejecutar:**

```
Fase final de ClassSport. Todo el código está implementado. Ahora testing y deploy.

TAREA: Testing completo, optimizaciones y configuración de producción.

1. **playwright.config.ts** — Configuración Playwright E2E:
   - Base URL: http://localhost:3000
   - Browsers: chromium (principal), firefox
   - Screenshots en fallos
   - Video en fallos

2. **tests/e2e/auth.spec.ts** — Tests de autenticación:
   - Login exitoso con profesor → redirect a /dashboard
   - Login fallido → mensaje de error visible
   - Acceso a /admin sin ser admin → redirect
   - Logout → redirect a /login

3. **tests/e2e/reservas.spec.ts** — Tests del flujo de reservas:
   - Flujo completo: login → bloques → salón → franja → confirmar → ver en mis-reservas
   - Intentar reservar franja ocupada → mensaje de conflicto
   - Cancelar reserva exitosamente
   - Verificar que franja cancelada vuelve a aparecer libre

4. **tests/e2e/admin.spec.ts** — Tests del panel admin:
   - Admin puede ver vista global con todas las reservas
   - Admin puede cancelar reserva de otro usuario
   - Admin puede crear nuevo salón
   - Exportar CSV genera descarga

5. **src/app/not-found.tsx** — Página 404 personalizada con ClassSport branding

6. **src/app/error.tsx** — Error boundary global con opción de "Intentar de nuevo"

7. **src/middleware.ts** (actualizar) — Añadir:
   - Rate limiting básico en middleware
   - Security headers: X-Frame-Options, X-Content-Type-Options, CSP básico
   - Log de accesos no autorizados

8. **next.config.ts** (optimizaciones):
   - Comprimir respuestas
   - Headers de seguridad
   - Image domains permitidos
   - Bundle analyzer en development

9. **README.md** completo:
   - Descripción del proyecto y features
   - Requisitos: Node 18+, cuenta Vercel
   - Setup local: paso a paso con comandos exactos
   - Variables de entorno necesarias con descripción
   - Comandos: dev, build, test, seed
   - Deploy a Vercel: paso a paso
   - Roles y credenciales demo
   - Arquitectura resumida

10. **Checklist de deploy** — Verificar antes de producción:
    - [ ] Variables de entorno en Vercel Dashboard configuradas
    - [ ] NEXTAUTH_URL apunta al dominio de producción
    - [ ] NEXTAUTH_SECRET es un valor seguro (openssl rand -base64 32)
    - [ ] Base de datos de producción separada del dev
    - [ ] Seed NO corre automáticamente en producción
    - [ ] Logs de Prisma desactivados en producción

11. **vercel.json** — Configuración de Vercel:
    - Región: iad1 (US East, más cercano a Latinoamérica)
    - Function timeout: 30s para /api/reservas (transacciones)
    - Headers de seguridad globales

Genera también el comando exacto para hacer el primer deploy:
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (primera vez — te pregunta configuración)
vercel

# Deploy a producción
vercel --prod
```

Después de este prompt, el proyecto estará completamente listo para producción.
```

**Entregable esperado:**
- Suite de tests E2E con Playwright (mínimo 15 tests)
- Aplicación optimizada con Lighthouse score >85
- README profesional completo
- Deploy exitoso en Vercel con URL de producción
- Security headers configurados

---

## 🔄 Regla Automática Post-Ejecución

> **IMPORTANTE:** Después de ejecutar CUALQUIER prompt de esta lista, Claude debe automáticamente:

### Paso 1 — Crear/Actualizar `Doc.md`
```markdown
## Resumen Fase [N]: [Nombre de la fase]

**Fecha:** YYYY-MM-DD
**Prompt ejecutado:** Prompt [N]

### Objetivo
[Qué se buscaba lograr con esta fase]

### Qué se implementó
- [Lista de funcionalidades/archivos creados]

### Archivos creados/modificados
| Archivo | Acción | Descripción |
|---|---|---|
| src/... | Creado | ... |

### Decisiones técnicas tomadas
- **[Decisión]:** [Razón por la que se tomó esta decisión]

### Próximos pasos
- [ ] [Tarea del siguiente prompt]
- [ ] [Verificación pendiente]

### Issues encontrados
- [Si hubo problemas, documentarlos aquí]
```

### Paso 2 — Actualizar `estado_ejecucion.md`
- Cambiar estado de la fase a ✅ Completado o 🔄 En progreso
- Actualizar % de avance
- Registrar fecha de inicio/fin
- Añadir entrada en Log de Cambios

---

*Versión: 1.0.0 | Proyecto: ClassSport | 6 prompts secuenciales para VS Code + Vercel*
