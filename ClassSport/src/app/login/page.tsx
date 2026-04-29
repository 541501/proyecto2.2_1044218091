'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al ingresar');
        setIsLoading(false);
        return;
      }

      // Exito — redirigir al dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError('Error en la conexión. Intente nuevamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Patrón geométrico sutil */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                rgba(71, 85, 105, 0.1) 0px,
                rgba(71, 85, 105, 0.1) 1px,
                transparent 1px,
                transparent 40px
              ),
              repeating-linear-gradient(
                90deg,
                rgba(71, 85, 105, 0.1) 0px,
                rgba(71, 85, 105, 0.1) 1px,
                transparent 1px,
                transparent 40px
              )
            `,
          }}
        />
      </div>

      {/* Contenedor centrado */}
      <div className="relative flex h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm rounded-lg border-t-4 border-t-blue-700 bg-white p-8 shadow-2xl"
        >
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <svg
              width="52"
              height="52"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-blue-700"
            >
              {/* Edificio académico estilizado */}
              <path
                d="M26 4L32 8V44H20V8L26 4Z"
                fill="currentColor"
                opacity="0.2"
              />
              <path
                d="M26 4L32 8V44H20V8L26 4Z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              {/* Ventanas */}
              <rect x="23" y="12" width="6" height="6" stroke="currentColor" strokeWidth="1" fill="none" />
              <rect x="23" y="22" width="6" height="6" stroke="currentColor" strokeWidth="1" fill="none" />
              <rect x="23" y="32" width="6" height="6" stroke="currentColor" strokeWidth="1" fill="none" />
              {/* Puerta */}
              <rect x="25" y="38" width="2" height="6" fill="currentColor" />
            </svg>
          </div>

          {/* Título */}
          <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">
            ClassSport
          </h1>

          {/* Tagline */}
          <p className="mb-8 text-center text-sm text-slate-500">
            Gestión de salones universitarios.
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Correo
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@classsport.edu.co"
                required
                disabled={isLoading}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}

            {/* Botón Ingresar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Pie */}
          <p className="mt-8 text-center text-xs text-slate-500">
            Institución Universitaria
          </p>
        </motion.div>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-800 to-primary-600 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-800 mb-2">
              ClassSport
            </h1>
            <p className="text-gray-600">
              Gestión de Salones Universitarios
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="usuario@classsport.edu"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary mt-6"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              Credenciales de Prueba:
            </p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>
                <strong>Admin:</strong> admin@classsport.edu / Admin123!
              </li>
              <li>
                <strong>Profesor:</strong> prof1@classsport.edu / Prof123!
              </li>
              <li>
                <strong>Coordinador:</strong> coordinador@classsport.edu / Prof123!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
