import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, formatStr: string = "dd/MM/yyyy") {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return format(date, formatStr, { locale: es });
}

export function formatTime(time: string): string {
  // time is expected to be in HH:MM format
  return time;
}

export function formatDateTime(
  date: Date | string,
  formatStr: string = "dd/MM/yyyy HH:mm"
) {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return format(date, formatStr, { locale: es });
}

export function formatRelativeTime(date: Date | string) {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: es,
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getRoleLabel(role: string): string {
  const roleLabels: Record<string, string> = {
    ADMIN: "Administrador",
    PROFESOR: "Profesor",
    COORDINADOR: "Coordinador",
  };
  return roleLabels[role] || role;
}

export function getReservationStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    CONFIRMADA: "Confirmada",
    CANCELADA: "Cancelada",
  };
  return statusLabels[status] || status;
}

export function getReservationStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-800",
    CONFIRMADA: "bg-green-100 text-green-800",
    CANCELADA: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getRoomTypeLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    AULA: "Aula",
    LABORATORIO: "Laboratorio",
    AUDITORIO: "Auditorio",
    SALA_SISTEMAS: "Sala de Sistemas",
  };
  return typeLabels[type] || type;
}
