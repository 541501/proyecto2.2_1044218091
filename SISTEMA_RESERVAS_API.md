# API de Reservas - Documentación Completa

## 🔐 Autenticación

Todas las rutas requieren autenticación con NextAuth. La sesión debe incluir:
- `user.id`: ID del usuario
- `user.rol`: ADMIN, PROFESOR, o COORDINADOR
- `user.nombre`: Nombre del usuario

---

## 📅 Endpoints de Reservas

### 1. Crear Reserva
**POST** `/api/reservas`

**Autenticación**: Requerida (cualquier rol)

**Body**:
```json
{
  "salonId": "string",
  "franjaId": "string",
  "fecha": "2025-04-23",
  "materia": "Matemáticas I",
  "grupo": "101",
  "observaciones": "opcional"
}
```

**Validaciones**:
- Fecha no puede ser en el pasado
- Fecha no puede ser fin de semana (sábado o domingo)
- Fecha no puede ser más de 60 días en el futuro
- Rate limit: máximo 10 reservas por usuario por hora

**Respuestas**:
- `201`: Reserva creada exitosamente
- `409`: Conflicto - Salón ya está reservado en ese horario
- `422`: Validación fallida
- `429`: Rate limit excedido (incluye header `Retry-After`)

**Ejemplo exitoso**:
```json
{
  "success": true,
  "data": {
    "id": "cuid123...",
    "salon": {
      "codigo": "A-101",
      "bloque": "A"
    },
    "franja": "07:00-08:00",
    "fecha": "2025-04-23",
    "materia": "Matemáticas I",
    "grupo": "101",
    "estado": "PENDIENTE",
    "createdAt": "2025-04-22T10:30:00Z"
  }
}
```

---

### 2. Obtener Mis Reservas
**GET** `/api/reservas`

**Autenticación**: Requerida (cualquier rol)

**Parámetros Query**:
- `estado`: PENDIENTE | CONFIRMADA | CANCELADA (opcional)
- `fecha`: YYYY-MM-DD (opcional - para filtrar por fecha específica)
- `salonId`: ID del salón (opcional)
- `page`: número de página (default: 1)
- `limit`: elementos por página (default: 20, máx: 100)

**Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid123...",
      "salon": {
        "codigo": "A-101",
        "bloque": "A"
      },
      "franja": "07:00-08:00",
      "fecha": "2025-04-23",
      "materia": "Matemáticas I",
      "grupo": "101",
      "estado": "PENDIENTE"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

**Ejemplos de uso**:
```
GET /api/reservas?estado=PENDIENTE&page=1&limit=10
GET /api/reservas?fecha=2025-04-23
GET /api/reservas?salonId=abc123
```

---

### 3. Obtener Detalle de Reserva
**GET** `/api/reservas/{id}`

**Autenticación**: Requerida
**Acceso**: Solo si eres el propietario o ADMIN

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "id": "cuid123...",
    "salon": {
      "codigo": "A-101",
      "bloque": "A"
    },
    "franja": "07:00-08:00",
    "fecha": "2025-04-23",
    "materia": "Matemáticas I",
    "grupo": "101",
    "observaciones": "sin equipamiento especial",
    "estado": "PENDIENTE",
    "profesor": "Dr. García",
    "createdAt": "2025-04-22T10:30:00Z",
    "updatedAt": "2025-04-22T10:30:00Z"
  }
}
```

**Códigos de respuesta**:
- `200`: Éxito
- `404`: Reserva no encontrada
- `403`: No autorizado para ver esta reserva

---

### 4. Cancelar Reserva
**DELETE** `/api/reservas/{id}`

**Autenticación**: Requerida
**Acceso**: Solo si eres el propietario o ADMIN

**Reglas de cancelación**:
- Solo se pueden cancelar reservas en estado PENDIENTE o CONFIRMADA
- No se pueden cancelar reservas del día actual o pasadas
- Los profesores solo pueden cancelar sus propias reservas
- Los admins pueden cancelar cualquier reserva

**Respuesta exitosa**:
```json
{
  "success": true,
  "message": "Reserva cancelada exitosamente"
}
```

**Códigos de respuesta**:
- `200`: Cancelación exitosa
- `403`: No autorizado o reserva no cancelable
- `404`: Reserva no encontrada

---

## 🔧 Endpoints Administrativos

### 5. Listar Todas las Reservas (Admin)
**GET** `/api/admin/reservas`

**Autenticación**: Requerida (solo ADMIN)

**Parámetros Query**:
- `salonId`: ID del salón (opcional)
- `usuarioId`: ID del usuario (opcional)
- `fecha`: YYYY-MM-DD (opcional)
- `estado`: PENDIENTE | CONFIRMADA | CANCELADA (opcional)
- `bloqueId`: ID del bloque (opcional)
- `formato`: json | csv (default: json)
- `page`: número de página (default: 1)
- `limit`: elementos por página (default: 50)

**Respuesta (JSON)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid123...",
      "profesor": "Dr. García",
      "email": "garcia@institution.edu",
      "departamento": "Matemáticas",
      "salon": {
        "codigo": "A-101",
        "bloque": "A"
      },
      "franja": "07:00-08:00",
      "fecha": "2025-04-23",
      "materia": "Matemáticas I",
      "grupo": "101",
      "estado": "PENDIENTE",
      "observaciones": "",
      "createdAt": "2025-04-22T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "pages": 3
  }
}
```

**Respuesta (CSV)**:
```
ID,Profesor,Email,Departamento,Salón,Bloque,Franja,Fecha,Materia,Grupo,Estado,Observaciones
cuid123...,Dr. García,garcia@institution.edu,Matemáticas,A-101,A,07:00-08:00,23/04/2025,Matemáticas I,101,PENDIENTE,
```

**Ejemplos de uso**:
```
GET /api/admin/reservas?formato=csv
GET /api/admin/reservas?bloqueId=abc&estado=CONFIRMADA
GET /api/admin/reservas?usuarioId=xyz&fecha=2025-04-23
```

---

### 6. Cambiar Estado de Reserva (Admin)
**PUT** `/api/admin/reservas/{id}`

**Autenticación**: Requerida (solo ADMIN)

**Body**:
```json
{
  "estado": "CONFIRMADA",
  "motivo": "Verificado - equipamiento disponible"
}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Reserva actualizada a estado CONFIRMADA",
  "data": {
    "id": "cuid123...",
    "salon": {
      "codigo": "A-101",
      "bloque": "A"
    },
    "profesor": "Dr. García",
    "franja": "07:00-08:00",
    "fecha": "2025-04-23",
    "materia": "Matemáticas I",
    "grupo": "101",
    "estado": "CONFIRMADA"
  }
}
```

**Códigos de respuesta**:
- `200`: Estado actualizado
- `400`: Validación fallida
- `403`: No autorizado
- `404`: Reserva no encontrada

---

## ⚠️ Códigos de Error

### 409 - Conflicto de Reserva
```json
{
  "error": "El salón A-101 ya está reservado el 23/04/2025 de 07:00 a 08:00 por Prof. García - Matemáticas I"
}
```

### 422 - Franja No Disponible
```json
{
  "error": "La franja seleccionada no es válida para este horario"
}
```

### 403 - No Modificable
```json
{
  "error": "No puedes cancelar reservas de otros profesores"
}
```

### 429 - Rate Limit
```json
{
  "error": "Demasiadas reservas. Máximo 10 por hora",
  "retryAfter": 1800,
  "resetAt": "2025-04-22T11:30:00Z"
}
```

---

## 🔄 Flujo de Transacciones

### Creación de Reserva (Anti-Conflictos)
1. Inicia transacción con nivel SERIALIZABLE
2. Verifica disponibilidad del salón/franja/fecha
3. Si conflicto: lanza `ConflictoReservaError` (409)
4. Si disponible: INSERT de la reserva
5. Invalida caché del horario del salón
6. Confirma transacción

### Caché y Disponibilidad
- Key: `horario:{salonId}:{fecha}`
- TTL: 60 segundos
- Se invalida después de cada reserva/cancelación

### Rate Limiting
- Key: `ratelimit:reservas:{userId}`
- Límite: 10 creaciones por hora
- Fallback: Map en memoria en desarrollo
- Redis en producción vía @vercel/kv

---

## 📝 Notas Importantes

1. **Sincronización**: Todas las operaciones que modifican caché se hacen DESPUÉS de la transacción exitosa
2. **Aislamiento**: Las transacciones usan SERIALIZABLE para prevenir condiciones de carrera
3. **Fechas**: Se usan `Date` con formato ISO. Siempre en UTC
4. **Paginación**: El default es página 1, límite 20 para usuarios y 50 para admins
5. **CSV**: El formato CSV es descargable con header `Content-Disposition: attachment`

---

## 🧪 Testing

### Crear una reserva
```bash
curl -X POST http://localhost:3000/api/reservas \
  -H "Content-Type: application/json" \
  -H "Cookie: <tu_sesion>" \
  -d '{
    "salonId": "abc123",
    "franjaId": "def456",
    "fecha": "2025-04-25",
    "materia": "Física",
    "grupo": "201"
  }'
```

### Listar mis reservas
```bash
curl http://localhost:3000/api/reservas?estado=PENDIENTE \
  -H "Cookie: <tu_sesion>"
```

### Cancelar una reserva
```bash
curl -X DELETE http://localhost:3000/api/reservas/cuid123 \
  -H "Cookie: <tu_sesion>"
```

### Descargar reporte CSV (Admin)
```bash
curl http://localhost:3000/api/admin/reservas?formato=csv&estado=CONFIRMADA \
  -H "Cookie: <tu_sesion>" \
  -o reservas.csv
```
