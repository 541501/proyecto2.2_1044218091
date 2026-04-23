# 🗺️ ClassSport — Plan de Implementación

> Roadmap ágil por fases con sprints semanales, criterios de aceptación y recursos necesarios.

---

## Resumen Ejecutivo

| Métrica | Valor |
|---|---|
| **Duración total estimada** | 8 semanas |
| **Fases** | 5 fases |
| **Sprints** | 8 sprints de 1 semana |
| **Equipo mínimo** | 2 personas (1 fullstack + 1 UX/QA) |
| **Deploy destino** | Vercel (preview + producción) |

---

## Roadmap por Fases

```
SEMANA:   1        2        3        4        5        6        7        8
          |--------|--------|--------|--------|--------|--------|--------|--------|
FASE 1:   [====Setup & Infraestructura====]
FASE 2:            [========Backend Core========]
FASE 3:                     [========Frontend Core========]
FASE 4:                                      [====Integración & Testing====]
FASE 5:                                               [====QA & Deploy====]
```

---

## Fase 1: Setup & Infraestructura (Semana 1)

### Sprint 1 — Fundamentos del Proyecto

**Objetivo:** Proyecto corriendo en local y Vercel con autenticación base.

| # | Tarea | Tiempo | Prioridad |
|---|---|---|---|
| 1.1 | Inicializar proyecto Next.js 14 con TypeScript + App Router | 2h | 🔴 Crítico |
| 1.2 | Configurar Tailwind CSS + shadcn/ui | 1h | 🔴 Crítico |
| 1.3 | Configurar Vercel Postgres + Prisma ORM | 2h | 🔴 Crítico |
| 1.4 | Diseñar y aplicar schema Prisma (todas las entidades) | 3h | 🔴 Crítico |
| 1.5 | Implementar NextAuth.js (credentials provider) | 3h | 🔴 Crítico |
| 1.6 | Crear middleware de autenticación y RBAC básico | 2h | 🔴 Crítico |
| 1.7 | Configurar repositorio GitHub + deploy inicial en Vercel | 1h | 🔴 Crítico |
| 1.8 | Crear seed de datos: bloques, salones, usuarios demo | 2h | 🟡 Alto |

**Total estimado:** ~16 horas

### Criterios de Aceptación — Fase 1

- [ ] `next dev` corre sin errores en local
- [ ] Deploy exitoso en Vercel con URL de preview
- [ ] Login/Logout funciona con usuario de prueba
- [ ] `npx prisma studio` muestra tablas creadas con seed data
- [ ] Middleware bloquea rutas no autenticadas → redirect a `/login`
- [ ] Variables de entorno configuradas en Vercel (DATABASE_URL, NEXTAUTH_SECRET)

---

## Fase 2: Backend Core (Semanas 2-3)

### Sprint 2 — API de Bloques, Salones y Franjas

**Objetivo:** APIs REST funcionales para la estructura base.

| # | Tarea | Tiempo | Prioridad |
|---|---|---|---|
| 2.1 | API Route: `GET /api/bloques` — lista todos los bloques | 1h | 🔴 Crítico |
| 2.2 | API Route: `GET /api/bloques/[id]/salones` — salones por bloque | 2h | 🔴 Crítico |
| 2.3 | API Route: `GET /api/salones/[id]` — detalle de salón | 1h | 🔴 Crítico |
| 2.4 | API Route: `GET /api/franjas` — franjas horarias disponibles | 1h | 🔴 Crítico |
| 2.5 | Validación de inputs con Zod en todas las rutas | 2h | 🔴 Crítico |
| 2.6 | Manejo de errores centralizado (error handler middleware) | 2h | 🟡 Alto |
| 2.7 | Tests unitarios de endpoints con Jest | 3h | 🟡 Alto |

**Total estimado:** ~12 horas

### Sprint 3 — API de Reservas (Core del Negocio)

**Objetivo:** CRUD completo de reservas con validación de conflictos.

| # | Tarea | Tiempo | Prioridad |
|---|---|---|---|
| 3.1 | API Route: `GET /api/salones/[id]/horario?fecha=YYYY-MM-DD` | 3h | 🔴 Crítico |
| 3.2 | API Route: `POST /api/reservas` con lock de transacción | 4h | 🔴 Crítico |
| 3.3 | Lógica anti-conflictos: UNIQUE constraint + SELECT FOR UPDATE | 2h | 🔴 Crítico |
| 3.4 | API Route: `GET /api/reservas` (mis reservas del usuario) | 2h | 🔴 Crítico |
| 3.5 | API Route: `DELETE /api/reservas/[id]` (cancelar) | 2h | 🟡 Alto |
| 3.6 | API Route: `GET /api/admin/reservas` (todas — solo admin) | 2h | 🟡 Alto |
| 3.7 | Implementar caché Redis (Vercel KV) para horarios | 3h | 🟡 Alto |
| 3.8 | Rate limiting por usuario (30 req/min) | 2h | 🟢 Medio |

**Total estimado:** ~20 horas

### Criterios de Aceptación — Fase 2

- [ ] `POST /api/reservas` con mismo salón+franja+fecha retorna `409 Conflict`
- [ ] Transacción DB garantiza no hay reservas duplicadas bajo carga concurrente
- [ ] Rutas admin retornan `403` si usuario es profesor
- [ ] Caché Redis reduce tiempo de respuesta de horarios en >50%
- [ ] Todos los endpoints validan y retornan errores descriptivos en JSON
- [ ] Tests unitarios con cobertura >80% en lógica de reservas

---

## Fase 3: Frontend Core (Semanas 3-4)

### Sprint 4 — Layouts, Navegación y Autenticación UI

**Objetivo:** Estructura visual del sistema con flujo de login completo.

| # | Tarea | Tiempo | Prioridad |
|---|---|---|---|
| 4.1 | Página de Login con formulario + manejo de errores | 3h | 🔴 Crítico |
| 4.2 | Layout principal: sidebar + navbar + área de contenido | 3h | 🔴 Crítico |
| 4.3 | Dashboard home: resumen de bloques y mis reservas | 4h | 🔴 Crítico |
| 4.4 | Componente: BloqueCard (A/B/C con salones disponibles) | 2h | 🔴 Crítico |
| 4.5 | Página de perfil de usuario + cerrar sesión | 2h | 🟡 Alto |
| 4.6 | Design system: tokens de color, tipografía, espaciado | 2h | 🟡 Alto |

**Total estimado:** ~16 horas

### Sprint 5 — Flujo de Reservas UI

**Objetivo:** Flujo completo profesor: seleccionar bloque → salón → franja → confirmar.

| # | Tarea | Tiempo | Prioridad |
|---|---|---|---|
| 5.1 | Página `/bloques` — grid de bloques A, B, C | 2h | 🔴 Crítico |
| 5.2 | Página `/bloques/[id]` — salones del bloque con disponibilidad | 3h | 🔴 Crítico |
| 5.3 | Componente: CalendarioSemanal (7 días × franjas horarias) | 5h | 🔴 Crítico |
| 5.4 | Componente: FranjaHoraria (verde/rojo/gris + tooltip info) | 3h | 🔴 Crítico |
| 5.5 | Modal: ConfirmarReserva (materia, grupo, resumen) | 3h | 🔴 Crítico |
| 5.6 | Página `/mis-reservas` — tabla con filtros y cancelación | 4h | 🟡 Alto |
| 5.7 | Toast notifications para éxito/error de reservas | 1h | 🟡 Alto |

**Total estimado:** ~21 horas

### Criterios de Aceptación — Fase 3

- [ ] Flujo completo: Login → Dashboard → Bloque → Salón → Reserva en <5 clics
- [ ] CalendarioSemanal muestra franjas coloreadas correctamente
- [ ] Franja ocupada es no-clickeable y muestra quién la reservó
- [ ] Modal de confirmación muestra resumen antes de crear reserva
- [ ] Responsive en mobile (375px), tablet (768px) y desktop (1280px)
- [ ] Loading states en todas las acciones asíncronas

---

## Fase 4: Panel Admin & Integración (Semana 5-6)

### Sprint 6 — Panel Administrativo

**Objetivo:** Vista completa para administradores/coordinadores.

| # | Tarea | Tiempo | Prioridad |
|---|---|---|---|
| 6.1 | Dashboard Admin: métricas de uso (salones más usados, % ocupación) | 4h | 🟡 Alto |
| 6.2 | Vista global: grid de TODOS los salones por día | 5h | 🔴 Crítico |
| 6.3 | Gestión de salones: CRUD (crear, editar, desactivar) | 4h | 🟡 Alto |
| 6.4 | Gestión de usuarios: listar, cambiar rol, activar/desactivar | 3h | 🟡 Alto |
| 6.5 | Cancelación masiva de reservas con motivo | 2h | 🟢 Medio |
| 6.6 | Exportar reporte de ocupación (CSV) | 3h | 🟢 Medio |

**Total estimado:** ~21 horas

### Sprint 7 — Integración React Query + Optimizaciones

**Objetivo:** Sistema integrado con caché, revalidación y manejo de errores globales.

| # | Tarea | Tiempo | Prioridad |
|---|---|---|---|
| 7.1 | Configurar React Query: queries, mutations, invalidación | 3h | 🔴 Crítico |
| 7.2 | Optimistic updates en creación/cancelación de reservas | 3h | 🟡 Alto |
| 7.3 | Error boundaries globales + páginas 404/500 customizadas | 2h | 🟡 Alto |
| 7.4 | Revalidación automática cada 60s en vista de horarios | 2h | 🟡 Alto |
| 7.5 | SEO básico: metadata, OpenGraph | 1h | 🟢 Medio |

**Total estimado:** ~11 horas

### Criterios de Aceptación — Fase 4

- [ ] Admin puede ver, crear, editar y desactivar salones
- [ ] Vista global muestra correctamente todos los salones y su estado
- [ ] Reporte CSV descargable con reservas del período seleccionado
- [ ] Optimistic UI: reserva aparece inmediatamente en calendario
- [ ] Si hay error de red, estado revierte y muestra toast de error

---

## Fase 5: Testing, QA y Deploy (Semanas 7-8)

### Sprint 8 — Testing End-to-End y Deploy Producción

| # | Tarea | Tiempo | Prioridad |
|---|---|---|---|
| 8.1 | Tests E2E con Playwright: flujo completo de reserva | 6h | 🔴 Crítico |
| 8.2 | Tests de conflicto de horarios (concurrencia simulada) | 3h | 🔴 Crítico |
| 8.3 | Pruebas de accesibilidad (axe-core, contraste de colores) | 2h | 🟡 Alto |
| 8.4 | Revisión de seguridad: OWASP top 10 básico | 3h | 🟡 Alto |
| 8.5 | Variables de entorno de producción en Vercel | 1h | 🔴 Crítico |
| 8.6 | Dominio personalizado + SSL en Vercel | 1h | 🟡 Alto |
| 8.7 | Configurar monitoreo (Vercel Analytics + errores) | 2h | 🟡 Alto |
| 8.8 | Documentación final del sistema (README.md) | 3h | 🟢 Medio |

**Total estimado:** ~21 horas

### Criterios de Aceptación — Fase 5

- [ ] Tests E2E pasan en CI/CD sin errores
- [ ] No existen rutas accesibles sin autenticación
- [ ] Performance Lighthouse score >85 en todas las páginas
- [ ] Deploy producción exitoso en dominio final
- [ ] README con instrucciones de instalación y deploy

---

## Dependencias Técnicas entre Módulos

```
[Fase 1: Setup]
    │
    ├──► [Fase 2: Backend]
    │         │
    │         ├──► API de Bloques/Salones ──► API de Reservas
    │         │              │                      │
    │         │              └──────────────────────┤
    │         │                                     │
    └──► [Fase 3: Frontend] ◄────────────────────────┘
              │
              ├──► Flujo Login ──► Dashboard ──► CalendarioSemanal
              │
              └──► [Fase 4: Admin]
                        │
                        └──► [Fase 5: QA & Deploy]
```

---

## Recursos Necesarios

### Perfiles del Equipo

| Perfil | Dedicación | Responsabilidades |
|---|---|---|
| **Fullstack Developer** | 100% | Backend APIs, DB schema, Frontend, integración |
| **UX/QA Engineer** | 50-100% | Diseño UI, pruebas, accesibilidad, documentación |

> ⚡ Para un solo desarrollador: duplicar tiempos estimados × 1.3 (gestión + contexto switching).

### Herramientas

| Categoría | Herramienta |
|---|---|
| **IDE** | Visual Studio Code |
| **Control de versiones** | Git + GitHub |
| **Deploy** | Vercel (CLI + Dashboard) |
| **DB visual** | Prisma Studio / TablePlus |
| **API Testing** | Thunder Client (VS Code) / Postman |
| **Diseño** | Figma (wireframes) |
| **Gestión** | GitHub Projects / Notion |

### Costos Estimados (Producción)

| Servicio | Plan | Costo/mes |
|---|---|---|
| Vercel | Pro | $20 USD |
| Vercel Postgres | Incluido Pro | $0 |
| Vercel KV | Incluido Pro | $0 |
| Dominio | Namecheap/GoDaddy | ~$12/año |
| **Total** | | **~$20/mes** |

---

*Versión: 1.0.0 | Proyecto: ClassSport | Metodología: Ágil (Sprints semanales)*
