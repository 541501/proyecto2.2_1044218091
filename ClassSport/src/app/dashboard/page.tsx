"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, redirectUrl: "/login" });
    toast.success("Sesión cerrada");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary-800">ClassSport</h1>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Bienvenido al panel de ClassSport!
          </h2>
          <p className="text-gray-600 mb-6">
            Esta es la página de inicio. El proyecto está completamente configurado y listo para empezar el desarrollo.
          </p>

          {/* User Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
              <h3 className="font-semibold text-primary-900 mb-2">Tu Información</h3>
              <ul className="space-y-2 text-sm text-primary-800">
                <li>
                  <strong>Nombre:</strong> {session?.user?.nombre}
                </li>
                <li>
                  <strong>Email:</strong> {session?.user?.email}
                </li>
                <li>
                  <strong>Rol:</strong> {session?.user?.rol}
                </li>
              </ul>
            </div>

            <div className="bg-success-50 border border-success-200 rounded-lg p-6">
              <h3 className="font-semibold text-success-900 mb-2">Próximos Pasos</h3>
              <ul className="space-y-2 text-sm text-success-800">
                <li>✓ Proyecto configurado</li>
                <li>✓ Base de datos lista</li>
                <li>✓ Autenticación activa</li>
                <li>➜ Crear componentes UI</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
