import { NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    nombre: string;
    email: string;
    rol: "ADMIN" | "PROFESOR" | "COORDINADOR";
  }

  interface Session {
    user?: User & {
      id: string;
      rol: "ADMIN" | "PROFESOR" | "COORDINADOR";
      nombre: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    rol: "ADMIN" | "PROFESOR" | "COORDINADOR";
    nombre: string;
  }
}

// Database types
export type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: "ADMIN" | "PROFESOR" | "COORDINADOR";
  departamento: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Bloque = {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Salon = {
  id: string;
  bloqueId: string;
  codigo: string;
  nombre: string;
  capacidad: number;
  tipo: "AULA" | "LABORATORIO" | "AUDITORIO" | "SALA_SISTEMAS";
  equipamiento: Record<string, any>;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type HoraFranja = {
  id: string;
  horaInicio: string;
  horaFin: string;
  etiqueta: string;
  orden: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Reserva = {
  id: string;
  salonId: string;
  usuarioId: string;
  franjaId: string;
  fecha: Date;
  materia: string;
  grupo: string;
  observaciones: string;
  estado: "PENDIENTE" | "CONFIRMADA" | "CANCELADA";
  createdAt: Date;
  updatedAt: Date;
};

// API Response types
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
