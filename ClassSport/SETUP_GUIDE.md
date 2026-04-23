# Guía de Instalación y Configuración - ClassSport

Este archivo contiene los comandos exactos para configurar el proyecto ClassSport desde cero.

## 🔧 Paso 1: Instalación de Dependencias

```bash
cd ClassSport
npm install
```

**Tiempo estimado:** 3-5 minutos (depende de tu conexión a internet)

## 🗄️ Paso 2: Configurar Vercel Postgres (Opción A - Vercel)

### Si usas Vercel Postgres:

```bash
# Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# Conectar con tu cuenta Vercel
vercel login

# Crear la conexión a Vercel Postgres
vercel env pull
```

Esto descargará automáticamente tus variables de entorno de Vercel.

## 🗄️ Paso 3: Configurar PostgreSQL Local (Opción B - Local)

### Si usas PostgreSQL local:

```bash
# En PowerShell (Windows) o terminal (Mac/Linux)
# Crear la base de datos
createdb classsport

# Verificar que fue creada
psql -l
```

### Luego, actualiza `.env.local`:

```env
POSTGRES_URL="postgresql://postgres:password@localhost:5432/classsport"
POSTGRES_PRISMA_URL="postgresql://postgres:password@localhost:5432/classsport"
POSTGRES_URL_NON_POOLING="postgresql://postgres:password@localhost:5432/classsport"
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## 🔐 Paso 4: Generar NEXTAUTH_SECRET

```powershell
# En PowerShell (Windows)
$secret = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes([guid]::NewGuid().ToString()))
Write-Host $secret
```

O usa este comando en bash/Mac:

```bash
openssl rand -base64 32
```

Copia el resultado y reemplaza `your-generated-secret` en `.env.local`.

## 📋 Paso 5: Copiar Variables de Entorno

```bash
# Desde la carpeta del proyecto
cp .env.local.example .env.local
```

Edita `.env.local` con tus valores reales.

## 🔄 Paso 6: Ejecutar Migraciones de Prisma

```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones (crea tablas en la BD)
npm run prisma:migrate
```

O alternativamente:

```bash
npx prisma migrate dev --name init
```

## 🌱 Paso 7: Cargar Datos de Prueba (Seed)

```bash
# Cargar datos de ejemplo
npm run db:seed
```

Esto creará:
- 3 bloques (A, B, C)
- 12 salones (4 por bloque)
- 8 franjas horarias
- 5 usuarios (1 admin, 1 coordinador, 3 profesores)
- 5 reservas de ejemplo

## 🚀 Paso 8: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Accede a: **http://localhost:3000**

## 🔐 Credenciales de Prueba

Después del seed, usa estas credenciales:

```
ADMINISTRADOR:
Email: admin@classsport.edu
Password: Admin123!

COORDINADOR:
Email: coordinador@classsport.edu
Password: Prof123!

PROFESORES:
Email: prof1@classsport.edu / prof2@classsport.edu / prof3@classsport.edu
Password: Prof123! (para todos)
```

## 📋 Comando Rápido Completo (Una sola vez)

```bash
# Ejecutar en la carpeta del proyecto
npm install && `
npm run prisma:generate && `
npm run prisma:migrate && `
npm run db:seed
```

Luego:

```bash
npm run dev
```

## 🧹 Paso 9: Comandos Útiles de Desarrollo

```bash
# Abrir Prisma Studio (UI para ver/editar BD)
npx prisma studio

# Ver el estado de las migraciones
npx prisma migrate status

# Reset de BD (CUIDADO - elimina todo)
npx prisma migrate reset

# Lint del código
npm run lint

# Build para producción
npm run build

# Ver servidor en producción local
npm start
```

## 🔄 Resetear Base de Datos (Si es necesario)

```bash
# ADVERTENCIA: Esto elimina todos los datos
npx prisma migrate reset

# Luego vuelve a correr el seed
npm run db:seed
```

## 🐛 Troubleshooting

### Error: "Cannot find module 'next-auth'"
```bash
npm install next-auth@latest
```

### Error: "Connection refused" en Prisma
- Verifica que PostgreSQL está corriendo
- En Windows: `Get-Process | grep postgres`
- En Mac: `ps aux | grep postgres`
- En Linux: `pgrep postgres`

### Error: ".env.local not found"
```bash
cp .env.local.example .env.local
# Luego edita con tus valores
```

### Error: "Migrations can't be applied"
```bash
# Fuerza el reset (cuidado - elimina todo)
npx prisma migrate reset
```

### Puerto 3000 ya está en uso
```bash
npm run dev -- -p 3001
```

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [NextAuth.js Documentation](https://authjs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## ✅ Checklist de Setup

- [ ] Clonar/Crear el proyecto
- [ ] Instalar dependencias (`npm install`)
- [ ] Copiar `.env.local.example` a `.env.local`
- [ ] Generar `NEXTAUTH_SECRET`
- [ ] Configurar variables de entorno
- [ ] Crear base de datos PostgreSQL
- [ ] Ejecutar migraciones (`npm run prisma:migrate`)
- [ ] Cargar datos de prueba (`npm run db:seed`)
- [ ] Iniciar servidor (`npm run dev`)
- [ ] Acceder a http://localhost:3000
- [ ] Iniciar sesión con credenciales de prueba

## 🎉 ¡Listo!

ClassSport está completamente configurado y listo para desarrollo.

¡A programar! 🚀
