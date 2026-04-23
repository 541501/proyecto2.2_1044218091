# ClassSport - Gestión de Salones Universitarios

Una plataforma integral para la gestión y reserva de salones académicos en instituciones educativas.

## 🎯 Características

- ✅ Autenticación segura con NextAuth.js v5
- ✅ Sistema de roles (Admin, Coordinador, Profesor)
- ✅ Gestión de salones por bloques
- ✅ Reserva de salones con franjas horarias
- ✅ Panel de administración
- ✅ Base de datos PostgreSQL con Prisma ORM
- ✅ UI moderna con Tailwind CSS y shadcn/ui
- ✅ TypeScript para type safety

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Estilos**: Tailwind CSS, shadcn/ui
- **Base de datos**: PostgreSQL (Vercel Postgres)
- **ORM**: Prisma
- **Autenticación**: NextAuth.js v5
- **Validación**: Zod, React Hook Form
- **Queries**: TanStack React Query
- **Notificaciones**: React Hot Toast

## 📋 Requisitos

- Node.js 18+
- PostgreSQL
- npm o yarn o pnpm

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus valores:

```env
POSTGRES_URL="postgresql://user:password@localhost:5432/classsport"
POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/classsport"
POSTGRES_URL_NON_POOLING="postgresql://user:password@localhost:5432/classsport"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Generar NEXTAUTH_SECRET (si no lo tienes)

```bash
# En PowerShell
$secret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))
Write-Host $secret

# En bash
openssl rand -base64 32
```

### 4. Crear la base de datos

```bash
# Crear base de datos PostgreSQL
createdb classsport
```

### 5. Ejecutar migraciones de Prisma

```bash
npm run prisma:migrate
```

O con:

```bash
npx prisma migrate dev --name init
```

### 6. Cargar datos de prueba (seed)

```bash
npm run db:seed
```

### 7. Iniciar servidor de desarrollo

```bash
npm run dev
```

Accede a `http://localhost:3000`

## 🔐 Credenciales de Prueba

Después de ejecutar el seed, usa estas credenciales:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@classsport.edu | Admin123! | Admin |
| coordinador@classsport.edu | Prof123! | Coordinador |
| prof1@classsport.edu | Prof123! | Profesor |
| prof2@classsport.edu | Prof123! | Profesor |
| prof3@classsport.edu | Prof123! | Profesor |

## 📁 Estructura del Proyecto

```
ClassSport/
├── prisma/
│   ├── schema.prisma       # Schema de base de datos
│   └── seed.ts             # Script de datos de prueba
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Estilos globales
│   ├── lib/
│   │   ├── auth.ts         # Configuración NextAuth
│   │   ├── prisma.ts       # Singleton de Prisma
│   │   ├── utils.ts        # Funciones auxiliares
│   │   └── query-client.ts # Configuración de React Query
│   ├── middleware.ts       # Middleware de protección de rutas
│   └── types/
│       └── index.ts        # Tipos TypeScript globales
├── .env.local.example      # Variables de entorno
├── next.config.js          # Configuración Next.js
├── tailwind.config.ts      # Configuración Tailwind
├── tsconfig.json           # Configuración TypeScript
└── package.json            # Dependencias
```

## 🗄️ Schema de Base de Datos

### Usuarios
- ID, Nombre, Email, Password Hash, Rol, Departamento, Activo

### Bloques
- ID, Nombre (A/B/C), Descripción, Activo

### Salones
- ID, Bloque ID, Código, Nombre, Capacidad, Tipo, Equipamiento, Activo

### Franjas Horarias
- ID, Hora Inicio, Hora Fin, Etiqueta, Orden

### Reservas
- ID, Salón ID, Usuario ID, Franja ID, Fecha, Materia, Grupo, Observaciones, Estado

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run dev                 # Iniciar servidor de desarrollo
npm run build              # Construir para producción
npm start                  # Iniciar servidor de producción
npm run lint               # Ejecutar linter

# Base de datos
npm run prisma:generate    # Generar cliente Prisma
npm run prisma:migrate     # Ejecutar migraciones
npm run db:push            # Push del schema a la BD
npm run db:seed            # Cargar datos de prueba
```

## 📚 Documentación

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [NextAuth.js Docs](https://authjs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 📧 Contacto

Para preguntas o soporte, contacta al equipo de ClassSport.
