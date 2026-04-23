"use client";

import { AdminLayout } from "@/components/admin-layout";
import { useSession, signOut } from "next-auth/react";
import toast from "react-hot-toast";

export default function AdminPage() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: true, redirectUrl: "/login" });
    toast.success("Sesión cerrada");
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary-800">ClassSport</h1>
              <p className="text-sm text-gray-600">Panel de Administración</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">{session?.user?.nombre}</p>
                <p className="text-sm text-gray-600">{session?.user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Panel de Administración
            </h2>

            {/* Admin Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Usuarios Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-2">👥</div>
                <h3 className="font-semibold text-blue-900 mb-2">Gestión de Usuarios</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Administra profesores, coordinadores y usuarios del sistema.
                </p>
                <button className="text-sm font-medium text-blue-700 hover:text-blue-900">
                  Ir a Usuarios →
                </button>
              </div>

              {/* Salones Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-2">🏫</div>
                <h3 className="font-semibold text-green-900 mb-2">Gestión de Salones</h3>
                <p className="text-sm text-green-700 mb-4">
                  Crea y administra salones, bloques y equipamiento.
                </p>
                <button className="text-sm font-medium text-green-700 hover:text-green-900">
                  Ir a Salones →
                </button>
              </div>

              {/* Reservas Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-2">📅</div>
                <h3 className="font-semibold text-purple-900 mb-2">Gestión de Reservas</h3>
                <p className="text-sm text-purple-700 mb-4">
                  Revisa y aprueba reservas de salones académicos.
                </p>
                <button className="text-sm font-medium text-purple-700 hover:text-purple-900">
                  Ir a Reservas →
                </button>
              </div>

              {/* Franjas Horarias Card */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-2">⏰</div>
                <h3 className="font-semibold text-orange-900 mb-2">Franjas Horarias</h3>
                <p className="text-sm text-orange-700 mb-4">
                  Configura horarios y franjas de disponibilidad.
                </p>
                <button className="text-sm font-medium text-orange-700 hover:text-orange-900">
                  Ir a Franjas →
                </button>
              </div>

              {/* Reportes Card */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-red-900 mb-2">Reportes</h3>
                <p className="text-sm text-red-700 mb-4">
                  Genera reportes de uso de salones y ocupación.
                </p>
                <button className="text-sm font-medium text-red-700 hover:text-red-900">
                  Ir a Reportes →
                </button>
              </div>

              {/* Configuración Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-2">⚙️</div>
                <h3 className="font-semibold text-gray-900 mb-2">Configuración</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Ajusta parámetros y configuración del sistema.
                </p>
                <button className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Ir a Configuración →
                </button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Estadísticas del Sistema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">Usuarios Activos</p>
                  <p className="text-2xl font-bold text-blue-800">5</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">Salones Disponibles</p>
                  <p className="text-2xl font-bold text-green-800">12</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">Reservas Hoy</p>
                  <p className="text-2xl font-bold text-purple-800">5</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">Ocupación Promedio</p>
                  <p className="text-2xl font-bold text-orange-800">42%</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
