import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de datos...");

  // Limpiar datos existentes
  await prisma.reserva.deleteMany({});
  await prisma.horaFranja.deleteMany({});
  await prisma.salon.deleteMany({});
  await prisma.bloque.deleteMany({});
  await prisma.usuario.deleteMany({});

  // Crear Bloques
  console.log("📦 Creando bloques...");
  const bloqueA = await prisma.bloque.create({
    data: {
      nombre: "A",
      descripcion: "Bloque A - Edificio Principal",
      activo: true,
    },
  });

  const bloqueB = await prisma.bloque.create({
    data: {
      nombre: "B",
      descripcion: "Bloque B - Edificio Anexo",
      activo: true,
    },
  });

  const bloqueC = await prisma.bloque.create({
    data: {
      nombre: "C",
      descripcion: "Bloque C - Laboratorios",
      activo: true,
    },
  });

  // Crear Salones
  console.log("🏫 Creando salones...");
  const salonTypes = [
    { tipo: "AULA", nombre: "Aula" },
    { tipo: "LABORATORIO", nombre: "Laboratorio" },
    { tipo: "AUDITORIO", nombre: "Auditorio" },
    { tipo: "SALA_SISTEMAS", nombre: "Sala de Sistemas" },
  ];

  const bloques = [bloqueA, bloqueB, bloqueC];
  const salones = [];

  for (let b = 0; b < bloques.length; b++) {
    for (let i = 1; i <= 4; i++) {
      const bloque = bloques[b];
      const salonType = salonTypes[i - 1];
      const codigoBloque = bloque.nombre;
      const codigo = `${codigoBloque}-10${i}`;

      const salon = await prisma.salon.create({
        data: {
          bloqueId: bloque.id,
          codigo,
          nombre: `${salonType.nombre} ${codigo}`,
          capacidad: 30 + i * 10,
          tipo: salonType.tipo as any,
          equipamiento: {
            proyector: i % 2 === 0,
            computadoras: i === 2 || i === 4,
            pizarra: true,
            aire_acondicionado: true,
            escritorios: i % 2 === 0 ? 30 : 25,
          },
          activo: true,
        },
      });
      salones.push(salon);
    }
  }

  // Crear Franjas Horarias
  console.log("⏰ Creando franjas horarias...");
  const franjas = [
    { horaInicio: "07:00", horaFin: "08:00", orden: 1 },
    { horaInicio: "08:00", horaFin: "09:00", orden: 2 },
    { horaInicio: "09:00", horaFin: "10:00", orden: 3 },
    { horaInicio: "10:00", horaFin: "11:00", orden: 4 },
    { horaInicio: "11:00", horaFin: "12:00", orden: 5 },
    { horaInicio: "12:00", horaFin: "13:00", orden: 6 },
    { horaInicio: "13:00", horaFin: "14:00", orden: 7 },
    { horaInicio: "14:00", horaFin: "15:00", orden: 8 },
  ];

  const franjaObjects = [];
  for (const franja of franjas) {
    const franjaObj = await prisma.horaFranja.create({
      data: {
        horaInicio: franja.horaInicio,
        horaFin: franja.horaFin,
        etiqueta: `${franja.horaInicio}-${franja.horaFin}`,
        orden: franja.orden,
      },
    });
    franjaObjects.push(franjaObj);
  }

  // Crear Usuarios
  console.log("👥 Creando usuarios...");
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const profPassword = await bcrypt.hash("Prof123!", 10);

  const admin = await prisma.usuario.create({
    data: {
      nombre: "Administrador ClassSport",
      email: "admin@classsport.edu",
      passwordHash: adminPassword,
      rol: "ADMIN",
      departamento: "Administración",
      activo: true,
    },
  });

  const prof1 = await prisma.usuario.create({
    data: {
      nombre: "Prof. Juan García",
      email: "prof1@classsport.edu",
      passwordHash: profPassword,
      rol: "PROFESOR",
      departamento: "Ingeniería",
      activo: true,
    },
  });

  const prof2 = await prisma.usuario.create({
    data: {
      nombre: "Prof. María López",
      email: "prof2@classsport.edu",
      passwordHash: profPassword,
      rol: "PROFESOR",
      departamento: "Ciencias",
      activo: true,
    },
  });

  const prof3 = await prisma.usuario.create({
    data: {
      nombre: "Prof. Carlos Rodríguez",
      email: "prof3@classsport.edu",
      passwordHash: profPassword,
      rol: "PROFESOR",
      departamento: "Humanidades",
      activo: true,
    },
  });

  const coordinador = await prisma.usuario.create({
    data: {
      nombre: "Coordinador Académico",
      email: "coordinador@classsport.edu",
      passwordHash: profPassword,
      rol: "COORDINADOR",
      departamento: "Coordinación Académica",
      activo: true,
    },
  });

  // Crear Reservas de ejemplo
  console.log("📅 Creando reservas de ejemplo...");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reservasData = [
    {
      salonId: salones[0].id,
      usuarioId: prof1.id,
      franjaId: franjaObjects[0].id,
      fecha: new Date(today),
      materia: "Cálculo I",
      grupo: "101",
      estado: "CONFIRMADA" as const,
    },
    {
      salonId: salones[1].id,
      usuarioId: prof2.id,
      franjaId: franjaObjects[1].id,
      fecha: new Date(today),
      materia: "Física II",
      grupo: "202",
      estado: "CONFIRMADA" as const,
    },
    {
      salonId: salones[2].id,
      usuarioId: prof3.id,
      franjaId: franjaObjects[2].id,
      fecha: new Date(today),
      materia: "Literatura Clásica",
      grupo: "301",
      estado: "PENDIENTE" as const,
    },
    {
      salonId: salones[3].id,
      usuarioId: prof1.id,
      franjaId: franjaObjects[3].id,
      fecha: new Date(today),
      materia: "Laboratorio de Programación",
      grupo: "102",
      estado: "CONFIRMADA" as const,
    },
    {
      salonId: salones[4].id,
      usuarioId: prof2.id,
      franjaId: franjaObjects[4].id,
      fecha: new Date(today),
      materia: "Biología General",
      grupo: "201",
      estado: "CONFIRMADA" as const,
    },
  ];

  for (const reservaData of reservasData) {
    await prisma.reserva.create({
      data: reservaData,
    });
  }

  console.log("✅ Seed completado exitosamente!");
  console.log("\n📊 Datos creados:");
  console.log(`   - Bloques: 3`);
  console.log(`   - Salones: 12`);
  console.log(`   - Franjas horarias: 8`);
  console.log(`   - Usuarios: 5 (1 Admin, 1 Coordinador, 3 Profesores)`);
  console.log(`   - Reservas: 5`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
