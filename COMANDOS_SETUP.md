# 🚀 COMANDOS EXACTOS - SETUP ClassSport

## ⚡ Setup en 10 Minutos

Copia y pega estos comandos uno por uno en **PowerShell** (Windows):

### Paso 1: Navega a la carpeta
```powershell
cd "C:\Users\BERLIN\Documents\log y prog\proyecto2.2_1044218091\ClassSport"
```

### Paso 2: Instala todas las dependencias
```powershell
npm install
```
*Espera a que termine (3-5 minutos)*

### Paso 3: Genera tu NEXTAUTH_SECRET
```powershell
$secret = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes([guid]::NewGuid().ToString()))
Write-Host "Tu SECRET es: $secret"
```
*Copia el valor que aparece (lo necesitarás en el siguiente paso)*

### Paso 4: Copia el archivo de variables de entorno
```powershell
Copy-Item -Path ".env.local.example" -Destination ".env.local"
```

### Paso 5: Abre el archivo .env.local y edítalo
```powershell
notepad .env.local
```

Actualiza estos valores:
```env
# Si usas PostgreSQL LOCAL:
POSTGRES_URL="postgresql://postgres:password@localhost:5432/classsport"
POSTGRES_PRISMA_URL="postgresql://postgres:password@localhost:5432/classsport"
POSTGRES_URL_NON_POOLING="postgresql://postgres:password@localhost:5432/classsport"

# El SECRET que generaste arriba:
NEXTAUTH_SECRET="pega-aqui-tu-secret"

# Esta URL debe ser así en local:
NEXTAUTH_URL="http://localhost:3000"
```

Guarda el archivo (Ctrl+S) y cierra (Ctrl+W)

### Paso 6: Crea la base de datos PostgreSQL
```powershell
# Si PostgreSQL está instalado
createdb classsport
```

### Paso 7: Genera el cliente de Prisma
```powershell
npm run prisma:generate
```

### Paso 8: Crea las tablas en BD
```powershell
npm run prisma:migrate
```

### Paso 9: Carga los datos de prueba
```powershell
npm run db:seed
```

Verás este output:
```
🌱 Iniciando seed de datos...
📦 Creando bloques...
🏫 Creando salones...
⏰ Creando franjas horarias...
👥 Creando usuarios...
📅 Creando reservas de ejemplo...
✅ Seed completado exitosamente!

📊 Datos creados:
   - Bloques: 3
   - Salones: 12
   - Franjas horarias: 8
   - Usuarios: 5 (1 Admin, 1 Coordinador, 3 Profesores)
   - Reservas: 5
```

### Paso 10: ¡Inicia el servidor!
```powershell
npm run dev
```

Verás algo como:
```
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 1.5s
```

---

## 🌐 Acceder a la Aplicación

Abre tu navegador y ve a: **http://localhost:3000**

---

## 🔐 Credenciales de Prueba

### ADMINISTRADOR
```
Email: admin@classsport.edu
Password: Admin123!
```

### COORDINADOR
```
Email: coordinador@classsport.edu
Password: Prof123!
```

### PROFESORES (igual para los 3)
```
Email: prof1@classsport.edu (o prof2@ o prof3@)
Password: Prof123!
```

---

## 📋 Verificación Rápida

Después de iniciar el servidor:

✅ Accede a http://localhost:3000
✅ Haz clic en "Iniciar Sesión"
✅ Usa las credenciales: admin@classsport.edu / Admin123!
✅ Deberías ver el panel administrativo
✅ Haz clic en "Cerrar Sesión"
✅ Prueba con otro usuario

---

## 🗄️ Ver la Base de Datos (Bonus)

En otra ventana de terminal, ejecuta:
```powershell
npx prisma studio
```

Esto abre una UI en http://localhost:5555 donde puedes:
- Ver todas las tablas
- Editar datos
- Crear nuevos registros
- Ver relaciones

---

## 🆘 Si Algo Falla

### Error: "npm: The term 'npm' is not recognized"
Instala Node.js desde: https://nodejs.org/

### Error: "createdb: The term 'createdb' is not recognized"
Instala PostgreSQL desde: https://www.postgresql.org/download/windows/

### Error: "Port 3000 already in use"
```powershell
npm run dev -- -p 3001
```

### Error: "Connection refused" en Prisma
- Verifica que PostgreSQL está corriendo
- Verifica las credenciales en .env.local

### Error: ".env.local not found"
```powershell
Copy-Item -Path ".env.local.example" -Destination ".env.local"
```

---

## 📚 Comandos Útiles Después de Setup

```powershell
# Abrir editor de BD
npx prisma studio

# Resetear BD completamente (CUIDADO)
npx prisma migrate reset

# Ver estado de migraciones
npx prisma migrate status

# Linter
npm run lint

# Build para producción
npm run build

# Ejecutar en producción local
npm start
```

---

## 📁 Ubicación de los Archivos

```
C:\Users\BERLIN\Documents\log y prog\proyecto2.2_1044218091\ClassSport\
├── .env.local (creas tú)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   ├── lib/
│   ├── components/
│   ├── types/
│   └── middleware.ts
└── package.json
```

---

## 🎯 Proyecto Completamente Configurado

| Característica | Estado |
|---|---|
| Autenticación | ✅ Implementada |
| Base de Datos | ✅ Configurada |
| Estilos Tailwind | ✅ Listos |
| TypeScript | ✅ Configurado |
| Datos de Prueba | ✅ Cargados |
| Middleware | ✅ Activo |
| Componentes Base | ✅ Creados |

---

## 🎉 ¡Listo para Desarrollar!

El proyecto está 100% funcional y listo para agregar:
- Más páginas
- Componentes personalizados
- APIs
- Funcionalidades específicas

**¡Ahora solo código! 🚀**

---

**Tiempo total de setup: ~15 minutos (con descargas)**
**Tiempo esperado sin descargas: ~5-8 minutos**
