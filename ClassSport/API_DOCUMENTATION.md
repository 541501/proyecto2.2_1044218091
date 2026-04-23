# 📚 API Documentation — ClassSport Backend

Esta documentación describe todas las APIs generadas para la Fase 2 (Backend Core).

---

## 🎯 Resumen de Endpoints

### Bloques
- `GET /api/bloques` - Listar todos los bloques
- `GET /api/bloques/[id]` - Detalle de un bloque
- `GET /api/bloques/[id]/salones` - Salones de un bloque

### Salones
- `GET /api/salones` - Listar salones (admin only)
- `GET /api/salones/[id]` - Detalle del salón
- `PUT /api/salones/[id]` - Actualizar salón (admin only)
- `DELETE /api/salones/[id]` - Soft delete (admin only)
- `GET /api/salones/[id]/horario` - Disponibilidad horaria

### Franjas
- `GET /api/franjas` - Listar franjas horarias

### Admin
- `POST /api/admin/salones` - Crear nuevo salón (admin only)

---

## 📋 Formatos de Respuesta

### Respuesta Exitosa
```json
{
  "success": true,
  "data": {
    "id": "...",
    "nombre": "..."
  }
}
```

### Respuesta Exitosa con Paginación
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 50,
    "page": 1
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "error": "Mensaje descriptivo del error",
  "code": "ERROR_CODE"
}
```

---

## 🔐 Autenticación

Todos los endpoints requieren **autenticación** vía NextAuth.js.

La sesión del usuario debe incluir:
- `user.id` - ID del usuario
- `user.rol` - Rol del usuario (ADMIN, COORDINADOR, PROFESOR)
- `user.email` - Email del usuario

**Ejemplo en cliente:**
```typescript
const session = await getSession();
const response = await fetch("/api/bloques", {
  headers: {
    "Authorization": `Bearer ${session?.user?.id}`,
  }
});
```

---

## 📡 Endpoints Detallados

### GET /api/bloques
**Descripción:** Lista todos los bloques activos con count de salones

**Autenticación:** Requerida

**Query Parameters:** Ninguno

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "blq_123",
      "nombre": "A",
      "descripcion": "Bloque A - Edificio Principal",
      "activo": true,
      "salonesCount": 4,
      "createdAt": "2026-04-23T10:00:00Z",
      "updatedAt": "2026-04-23T10:00:00Z"
    }
  ]
}
```

**Cache:** 5 minutos

---

### GET /api/bloques/[id]
**Descripción:** Obtiene detalle de un bloque con sus salones

**Autenticación:** Requerida

**Path Parameters:**
- `id` (string) - ID del bloque

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "blq_123",
    "nombre": "A",
    "descripcion": "Bloque A",
    "activo": true,
    "salones": [
      {
        "id": "sal_001",
        "codigo": "A-101",
        "nombre": "Aula A-101",
        "capacidad": 40,
        "tipo": "AULA",
        "equipamiento": {
          "proyector": true,
          "aire_acondicionado": true
        }
      }
    ]
  }
}
```

---

### GET /api/bloques/[id]/salones
**Descripción:** Lista salones de un bloque, opcionalmente con disponibilidad

**Autenticación:** Requerida

**Path Parameters:**
- `id` (string) - ID del bloque

**Query Parameters:**
- `fecha` (string, opcional) - Formato: YYYY-MM-DD. Si se proporciona, agrega información de disponibilidad

**Response (sin fecha):**
```json
{
  "success": true,
  "data": [
    {
      "id": "sal_001",
      "codigo": "A-101",
      "nombre": "Aula A-101",
      "capacidad": 40,
      "tipo": "AULA",
      "equipamiento": {...}
    }
  ]
}
```

**Response (con fecha):**
```json
{
  "success": true,
  "data": [
    {
      "id": "sal_001",
      "codigo": "A-101",
      "nombre": "Aula A-101",
      "capacidad": 40,
      "tipo": "AULA",
      "equipamiento": {...},
      "slotsDisponibles": 6,
      "slotsOcupados": 2
    }
  ]
}
```

**Errores:**
- `BLOQUE_NOT_FOUND` (404) - Bloque no existe
- `INVALID_DATE` (400) - Fecha con formato incorrecto
- `WEEKEND_NOT_ALLOWED` (400) - Fecha cae en fin de semana

---

### GET /api/salones
**Descripción:** Lista salones con filtros y paginación (admin/coordinador)

**Autenticación:** Requerida (admin o coordinador)

**Query Parameters:**
- `bloqueId` (string, opcional) - Filtrar por bloque
- `tipo` (enum, opcional) - AULA | LABORATORIO | AUDITORIO | SALA_SISTEMAS
- `activo` (boolean, default: true) - Filtrar por estado
- `page` (number, default: 1) - Número de página
- `limit` (number, default: 20, max: 100) - Items por página

**Example:**
```
GET /api/salones?bloqueId=blq_123&tipo=AULA&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sal_001",
      "codigo": "A-101",
      "nombre": "Aula A-101",
      "capacidad": 40,
      "tipo": "AULA",
      "bloque": {
        "id": "blq_123",
        "nombre": "A"
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1
  }
}
```

**Errores:**
- `UNAUTHORIZED` (401) - No autenticado
- `FORBIDDEN` (403) - Rol insuficiente

---

### GET /api/salones/[id]
**Descripción:** Obtiene detalle completo de un salón

**Autenticación:** Requerida

**Path Parameters:**
- `id` (string) - ID del salón

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sal_001",
    "codigo": "A-101",
    "nombre": "Aula A-101",
    "capacidad": 40,
    "tipo": "AULA",
    "equipamiento": {...},
    "bloque": {
      "id": "blq_123",
      "nombre": "A"
    },
    "reservas": [
      {
        "id": "res_001",
        "fecha": "2026-04-24",
        "estado": "CONFIRMADA"
      }
    ]
  }
}
```

---

### PUT /api/salones/[id]
**Descripción:** Actualiza información del salón

**Autenticación:** Requerida (admin only)

**Path Parameters:**
- `id` (string) - ID del salón

**Request Body:**
```json
{
  "nombre": "Aula Nueva",
  "capacidad": 45,
  "tipo": "LABORATORIO",
  "equipamiento": {
    "computadoras": true,
    "proyector": true
  },
  "activo": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sal_001",
    "codigo": "A-101",
    "nombre": "Aula Nueva",
    "capacidad": 45,
    ...
  }
}
```

---

### DELETE /api/salones/[id]
**Descripción:** Marca un salón como inactivo (soft delete)

**Autenticación:** Requerida (admin only)

**Path Parameters:**
- `id` (string) - ID del salón

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Salón marcado como inactivo",
    "salon": {
      "id": "sal_001",
      "activo": false
    }
  }
}
```

**Errores:**
- `SALON_HAS_RESERVATIONS` (409) - Salón tiene reservas futuras confirmadas

---

### GET /api/salones/[id]/horario
**Descripción:** Obtiene disponibilidad horaria de un salón

**Autenticación:** Requerida

**Path Parameters:**
- `id` (string) - ID del salón

**Query Parameters:**
- `fecha` (string, requerido) - Formato: YYYY-MM-DD
- `semana` (boolean, default: false) - Si true, retorna 5 días (lunes-viernes)

**Examples:**
```
GET /api/salones/sal_001/horario?fecha=2026-04-24
GET /api/salones/sal_001/horario?fecha=2026-04-24&semana=true
```

**Response (día único):**
```json
{
  "success": true,
  "data": {
    "salon": {
      "id": "sal_001",
      "codigo": "A-101",
      "nombre": "Aula A-101"
    },
    "fecha": "2026-04-24",
    "horario": [
      {
        "id": "frj_001",
        "horaInicio": "07:00",
        "horaFin": "08:00",
        "estado": "LIBRE"
      },
      {
        "id": "frj_002",
        "horaInicio": "08:00",
        "horaFin": "09:00",
        "estado": "OCUPADO",
        "reserva": {
          "profesor": "Prof. García",
          "profesorEmail": "prof1@classsport.edu",
          "materia": "Cálculo I",
          "grupo": "101",
          "estado": "CONFIRMADA"
        }
      }
    ]
  }
}
```

**Response (semana):**
```json
{
  "success": true,
  "data": {
    "salon": {...},
    "semana": [
      {
        "fecha": "2026-04-28",
        "horario": [...]
      },
      {
        "fecha": "2026-04-29",
        "horario": [...]
      }
      // ... 5 días totales
    ]
  }
}
```

**Notas:**
- Profesores solo ven LIBRE/OCUPADO/PENDIENTE
- Admin ve información completa del profesor y materia
- No se puede consultar fin de semana
- No se puede consultar más de 30 días en el futuro

**Errores:**
- `MISSING_FECHA` (400) - Parámetro fecha requerido
- `INVALID_DATE` (400) - Fecha inválida
- `WEEKEND_NOT_ALLOWED` (400) - Fecha es fin de semana
- `DATE_TOO_FAR` (400) - Más de 30 días en el futuro

---

### GET /api/franjas
**Descripción:** Lista todas las franjas horarias

**Autenticación:** Requerida

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "frj_001",
      "horaInicio": "07:00",
      "horaFin": "08:00",
      "etiqueta": "07:00-08:00",
      "orden": 1
    },
    {
      "id": "frj_002",
      "horaInicio": "08:00",
      "horaFin": "09:00",
      "etiqueta": "08:00-09:00",
      "orden": 2
    }
  ]
}
```

**Cache:** 1 hora

---

### POST /api/admin/salones
**Descripción:** Crea un nuevo salón

**Autenticación:** Requerida (admin only)

**Request Body:**
```json
{
  "bloqueId": "blq_123",
  "codigo": "A-105",
  "nombre": "Aula A-105",
  "capacidad": 40,
  "tipo": "AULA",
  "equipamiento": {
    "proyector": true,
    "aire_acondicionado": true,
    "escritorios": 40
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sal_002",
    "bloqueId": "blq_123",
    "codigo": "A-105",
    "nombre": "Aula A-105",
    "capacidad": 40,
    "tipo": "AULA",
    "equipamiento": {...},
    "activo": true,
    "bloque": {
      "id": "blq_123",
      "nombre": "A"
    }
  }
}
```

**HTTP Status:** 201 (Created)

**Errores:**
- `BLOQUE_NOT_FOUND` (404) - Bloque no existe
- `DUPLICATE_CODIGO` (409) - Código ya existe en este bloque
- `INVALID_CAPACIDAD` (400) - Capacidad inválida
- `VALIDATION_ERROR` (400) - Datos de validación fallo

---

## 🛠️ Códigos de Error

| Código | Descripción | HTTP Status |
|--------|------------|------------|
| `UNAUTHORIZED` | No autenticado | 401 |
| `FORBIDDEN` | Permiso denegado | 403 |
| `BLOQUE_NOT_FOUND` | Bloque no existe | 404 |
| `SALON_NOT_FOUND` | Salón no existe | 404 |
| `DUPLICATE_CODIGO` | Código duplicado | 409 |
| `SALON_HAS_RESERVATIONS` | Salón con reservas futuras | 409 |
| `INVALID_DATE` | Fecha inválida | 400 |
| `WEEKEND_NOT_ALLOWED` | Fin de semana no permitido | 400 |
| `DATE_TOO_FAR` | Fecha muy lejana | 400 |
| `DATE_IN_PAST` | Fecha en el pasado | 400 |
| `MISSING_FECHA` | Falta parámetro fecha | 400 |
| `VALIDATION_ERROR` | Error de validación | 400 |
| `INTERNAL_SERVER_ERROR` | Error del servidor | 500 |

---

## 🧪 Ejemplos de Uso

### Obtener bloques disponibles
```bash
curl -X GET http://localhost:3000/api/bloques \
  -H "Content-Type: application/json"
```

### Crear un nuevo salón
```bash
curl -X POST http://localhost:3000/api/admin/salones \
  -H "Content-Type: application/json" \
  -d '{
    "bloqueId": "blq_123",
    "codigo": "A-105",
    "nombre": "Aula A-105",
    "capacidad": 40,
    "tipo": "AULA",
    "equipamiento": {"proyector": true}
  }'
```

### Consultar disponibilidad de un salón
```bash
curl -X GET "http://localhost:3000/api/salones/sal_001/horario?fecha=2026-04-24"
```

### Consultar disponibilidad de una semana
```bash
curl -X GET "http://localhost:3000/api/salones/sal_001/horario?fecha=2026-04-24&semana=true"
```

---

## 📊 Caché

| Endpoint | Duración |
|----------|----------|
| `/api/bloques` | 5 minutos |
| `/api/franjas` | 1 hora |
| Otros | Sin caché |

---

## 📝 Notas Importantes

1. **Autenticación:** Todas las rutas requieren sesión activa via NextAuth.js
2. **Soft Delete:** DELETE marca salones como inactivos, no los borra
3. **Validación:** Zod valida todos los inputs antes de procesar
4. **Errores:** Todos los errores siguen el formato estandarizado
5. **Paginación:** Default 20 items, máximo 100
6. **Fechas:** Formato ISO YYYY-MM-DD
7. **Roles:** ADMIN acceso total, COORDINADOR puede listar, PROFESOR solo lectura

---

**API Version:** 1.0.0  
**Última Actualización:** 2026-04-23
